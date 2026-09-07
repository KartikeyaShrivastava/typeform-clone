"""Business logic for forms and questions."""
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.form import Form, FormStatus
from app.models.question import Question
from app.models.response import FormResponse
from app.schemas.form import FormCreate, FormUpdate
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.utils.validators import generate_slug, validate_question_options


async def _get_form_or_404(db: AsyncSession, form_id: str, with_questions: bool = False) -> Form:
    stmt = select(Form).where(Form.id == form_id)
    if with_questions:
        stmt = stmt.options(selectinload(Form.questions))
    result = await db.execute(stmt)
    form = result.scalar_one_or_none()
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


async def _get_question_or_404(db: AsyncSession, question_id: str) -> Question:
    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return question


async def list_forms(db: AsyncSession) -> list[dict]:
    stmt = (
        select(Form, func.count(FormResponse.id).label("response_count"))
        .outerjoin(FormResponse, FormResponse.form_id == Form.id)
        .group_by(Form.id)
        .order_by(Form.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [{"form": form, "response_count": count} for form, count in rows]


async def create_form(db: AsyncSession, payload: FormCreate) -> Form:
    form = Form(title=payload.title, status=FormStatus.DRAFT)
    db.add(form)
    await db.commit()
    await db.refresh(form)
    return form


async def get_form(db: AsyncSession, form_id: str) -> Form:
    return await _get_form_or_404(db, form_id, with_questions=True)


async def update_form(db: AsyncSession, form_id: str, payload: FormUpdate) -> Form:
    form = await _get_form_or_404(db, form_id, with_questions=True)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(form, field, value)
    await db.commit()
    await db.refresh(form)
    return form


async def delete_form(db: AsyncSession, form_id: str) -> None:
    form = await _get_form_or_404(db, form_id)
    await db.delete(form)
    await db.commit()


async def duplicate_form(db: AsyncSession, form_id: str) -> Form:
    original = await _get_form_or_404(db, form_id, with_questions=True)
    new_form = Form(
        title=f"{original.title} (Copy)",
        description=original.description,
        status=FormStatus.DRAFT,
        theme_config=original.theme_config,
        thank_you_title=original.thank_you_title,
        thank_you_message=original.thank_you_message,
    )
    db.add(new_form)
    await db.flush()

    for q in original.questions:
        db.add(
            Question(
                form_id=new_form.id,
                question_text=q.question_text,
                description=q.description,
                question_type=q.question_type,
                required=q.required,
                position=q.position,
                options=q.options,
                settings=q.settings,
            )
        )

    await db.commit()
    await db.refresh(new_form)
    return await _get_form_or_404(db, new_form.id, with_questions=True)


async def publish_form(db: AsyncSession, form_id: str) -> Form:
    form = await _get_form_or_404(db, form_id)
    if not form.public_slug:
        slug = generate_slug()
        while (await db.execute(select(Form).where(Form.public_slug == slug))).scalar_one_or_none():
            slug = generate_slug()
        form.public_slug = slug
    form.status = FormStatus.PUBLISHED
    await db.commit()
    await db.refresh(form)
    return form


async def unpublish_form(db: AsyncSession, form_id: str) -> Form:
    form = await _get_form_or_404(db, form_id)
    form.status = FormStatus.DRAFT
    await db.commit()
    await db.refresh(form)
    return form


async def create_question(db: AsyncSession, form_id: str, payload: QuestionCreate) -> Question:
    await _get_form_or_404(db, form_id)
    validate_question_options(payload.question_type, payload.options)

    max_position_result = await db.execute(
        select(func.max(Question.position)).where(Question.form_id == form_id)
    )
    max_position = max_position_result.scalar()
    next_position = (max_position + 1) if max_position is not None else 0

    question = Question(
        form_id=form_id,
        question_text=payload.question_text,
        description=payload.description,
        question_type=payload.question_type,
        required=payload.required,
        options=payload.options,
        settings=payload.settings,
        position=next_position,
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


async def update_question(db: AsyncSession, question_id: str, payload: QuestionUpdate) -> Question:
    question = await _get_question_or_404(db, question_id)
    data = payload.model_dump(exclude_unset=True)

    resulting_type = data.get("question_type", question.question_type)
    resulting_options = data.get("options", question.options)
    validate_question_options(resulting_type, resulting_options)

    for field, value in data.items():
        setattr(question, field, value)

    await db.commit()
    await db.refresh(question)
    return question


async def delete_question(db: AsyncSession, question_id: str) -> None:
    question = await _get_question_or_404(db, question_id)
    form_id = question.form_id
    await db.delete(question)
    await db.flush()

    result = await db.execute(
        select(Question).where(Question.form_id == form_id).order_by(Question.position)
    )
    remaining = result.scalars().all()
    for index, q in enumerate(remaining):
        q.position = index

    await db.commit()


async def reorder_questions(db: AsyncSession, form_id: str, question_ids: list[str]) -> list[Question]:
    await _get_form_or_404(db, form_id)

    if len(question_ids) != len(set(question_ids)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate question IDs in reorder request")

    result = await db.execute(select(Question).where(Question.form_id == form_id))
    existing_questions = {q.id: q for q in result.scalars().all()}

    if set(question_ids) != set(existing_questions.keys()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="question_ids must contain exactly the questions belonging to this form",
        )

    for index, qid in enumerate(question_ids):
        existing_questions[qid].position = index

    await db.commit()

    result = await db.execute(
        select(Question).where(Question.form_id == form_id).order_by(Question.position)
    )
    return result.scalars().all()
