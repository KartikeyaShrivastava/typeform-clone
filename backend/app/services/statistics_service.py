"""Business logic for computing per-form response statistics."""
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.form import Form
from app.models.question import Question, QuestionType
from app.models.response import Answer, FormResponse


async def _get_form_with_data(db: AsyncSession, form_id: str) -> Form:
    result = await db.execute(
        select(Form)
        .options(
            selectinload(Form.questions),
            selectinload(Form.responses).selectinload(FormResponse.answers),
        )
        .where(Form.id == form_id)
    )
    form = result.scalar_one_or_none()
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


def _numeric(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return value
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _compute_choice_stats(answers: list) -> dict:
    counts: dict[str, int] = {}
    for value in answers:
        if value is None:
            continue
        key = str(value)
        counts[key] = counts.get(key, 0) + 1
    return {"counts": counts}


def _compute_yes_no_stats(answers: list) -> dict:
    true_count = sum(1 for v in answers if v is True)
    false_count = sum(1 for v in answers if v is False)
    return {"true_count": true_count, "false_count": false_count}


def _compute_rating_stats(answers: list, question: Question) -> dict:
    settings = question.settings or {}
    max_rating = int(settings.get("max", 5))
    min_rating = int(settings.get("min", 1))

    numeric_values = [_numeric(v) for v in answers]
    numeric_values = [v for v in numeric_values if v is not None]

    distribution = {str(i): 0 for i in range(min_rating, max_rating + 1)}
    for v in numeric_values:
        key = str(int(v))
        if key in distribution:
            distribution[key] += 1

    average = round(sum(numeric_values) / len(numeric_values), 2) if numeric_values else None
    return {"average": average, "distribution": distribution}


def _compute_number_stats(answers: list) -> dict:
    numeric_values = [_numeric(v) for v in answers]
    numeric_values = [v for v in numeric_values if v is not None]
    if not numeric_values:
        return {"min": None, "max": None, "average": None}
    return {
        "min": min(numeric_values),
        "max": max(numeric_values),
        "average": round(sum(numeric_values) / len(numeric_values), 2),
    }


def _compute_text_stats(answers: list) -> dict:
    non_empty = [str(v) for v in answers if v is not None and str(v).strip() != ""]
    recent = list(reversed(non_empty))[:5]
    return {"answered_count": len(non_empty), "recent_answers": recent}


async def get_form_statistics(db: AsyncSession, form_id: str) -> dict:
    form = await _get_form_with_data(db, form_id)

    answers_by_question: dict[str, list] = {q.id: [] for q in form.questions}
    for response in form.responses:
        for answer in response.answers:
            if answer.question_id in answers_by_question:
                answers_by_question[answer.question_id].append(answer.answer_value)

    question_stats = []
    for question in form.questions:
        answers = answers_by_question.get(question.id, [])

        if question.question_type in (QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN):
            stats = _compute_choice_stats(answers)
        elif question.question_type == QuestionType.YES_NO:
            stats = _compute_yes_no_stats(answers)
        elif question.question_type == QuestionType.RATING:
            stats = _compute_rating_stats(answers, question)
        elif question.question_type == QuestionType.NUMBER:
            stats = _compute_number_stats(answers)
        else:
            stats = _compute_text_stats(answers)

        question_stats.append(
            {
                "question_id": question.id,
                "question_text": question.question_text,
                "question_type": question.question_type,
                "statistics": stats,
            }
        )

    # Compute average completion time
    completion_times = [
        r.completion_time_seconds
        for r in form.responses
        if r.completion_time_seconds is not None
    ]
    avg_completion = (
        round(sum(completion_times) / len(completion_times), 1)
        if completion_times
        else None
    )

    return {
        "total_responses": len(form.responses),
        "average_completion_seconds": avg_completion,
        "questions": question_stats,
    }
