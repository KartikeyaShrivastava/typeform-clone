"""Business logic for submitting and reading form responses."""
import math

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.form import Form, FormStatus
from app.models.question import Question
from app.models.response import Answer, FormResponse
from app.schemas.response import ResponseSubmit
from app.utils.validators import AnswerValidationError, validate_answer_value


async def get_published_form_by_slug(db: AsyncSession, slug: str) -> Form:
    result = await db.execute(
        select(Form).options(selectinload(Form.questions)).where(Form.public_slug == slug)
    )
    form = result.scalar_one_or_none()
    if form is None or form.status != FormStatus.PUBLISHED:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


async def submit_response(db: AsyncSession, slug: str, payload: ResponseSubmit) -> FormResponse:
    form = await get_published_form_by_slug(db, slug)

    questions_by_id: dict[str, Question] = {q.id: q for q in form.questions}
    submitted_by_id = {a.question_id: a.answer_value for a in payload.answers}

    errors: list[dict] = []

    for question in form.questions:
        value = submitted_by_id.get(question.id)
        try:
            validate_answer_value(question, value)
        except AnswerValidationError as exc:
            errors.append({"question_id": exc.question_id, "message": exc.message})

    for qid in submitted_by_id:
        if qid not in questions_by_id:
            errors.append({"question_id": qid, "message": "Question does not belong to this form"})

    if errors:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=errors)

    response = FormResponse(
        form_id=form.id,
        completion_time_seconds=payload.completion_time_seconds,
        response_metadata=payload.metadata,
    )
    db.add(response)
    await db.flush()

    for answer in payload.answers:
        if answer.question_id not in questions_by_id:
            continue
        db.add(
            Answer(
                response_id=response.id,
                question_id=answer.question_id,
                answer_value=answer.answer_value,
            )
        )

    await db.commit()
    await db.refresh(response)
    return response


async def _get_form_or_404(db: AsyncSession, form_id: str) -> Form:
    result = await db.execute(select(Form).where(Form.id == form_id))
    form = result.scalar_one_or_none()
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


def _preview_value(value) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, (list, dict)):
        return str(value)
    return str(value)


async def list_responses(db: AsyncSession, form_id: str, page: int, limit: int) -> dict:
    await _get_form_or_404(db, form_id)

    total_result = await db.execute(
        select(func.count(FormResponse.id)).where(FormResponse.form_id == form_id)
    )
    total = total_result.scalar_one()

    offset = (page - 1) * limit
    result = await db.execute(
        select(FormResponse)
        .options(selectinload(FormResponse.answers))
        .where(FormResponse.form_id == form_id)
        .order_by(FormResponse.submitted_at.desc())
        .offset(offset)
        .limit(limit)
    )
    responses = result.scalars().all()

    items = []
    for r in responses:
        preview_parts = [_preview_value(a.answer_value) for a in r.answers[:3] if a.answer_value is not None]
        items.append(
            {
                "id": r.id,
                "submitted_at": r.submitted_at,
                "completion_time_seconds": r.completion_time_seconds,
                "answer_preview": " | ".join(p for p in preview_parts if p) or None,
            }
        )

    total_pages = math.ceil(total / limit) if limit else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


async def get_response_detail(db: AsyncSession, form_id: str, response_id: str) -> dict:
    await _get_form_or_404(db, form_id)

    result = await db.execute(
        select(FormResponse)
        .options(selectinload(FormResponse.answers).selectinload(Answer.question))
        .where(FormResponse.id == response_id, FormResponse.form_id == form_id)
    )
    response = result.scalar_one_or_none()
    if response is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response not found")

    answers = [
        {
            "question_id": a.question_id,
            "question_text": a.question.question_text if a.question else "",
            "question_type": a.question.question_type if a.question else None,
            "answer_value": a.answer_value,
        }
        for a in response.answers
    ]

    return {
        "id": response.id,
        "form_id": response.form_id,
        "submitted_at": response.submitted_at,
        "completion_time_seconds": response.completion_time_seconds,
        "metadata": response.response_metadata,
        "answers": answers,
    }
