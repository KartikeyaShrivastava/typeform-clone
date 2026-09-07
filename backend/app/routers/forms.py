"""Form and question management endpoints (creator-facing, no auth per spec)."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.form import FormCreate, FormListItem, FormRead, FormUpdate, PublishResponse
from app.schemas.question import QuestionCreate, QuestionRead, QuestionUpdate, ReorderRequest
from app.services import form_service

router = APIRouter(prefix="/api/forms", tags=["Forms"])
questions_router = APIRouter(prefix="/api/questions", tags=["Questions"])


@router.get("", response_model=list[FormListItem], summary="List all forms")
async def get_forms(db: AsyncSession = Depends(get_db)):
    rows = await form_service.list_forms(db)
    return [
        FormListItem(
            id=row["form"].id,
            title=row["form"].title,
            status=row["form"].status,
            response_count=row["response_count"],
            created_at=row["form"].created_at,
            updated_at=row["form"].updated_at,
        )
        for row in rows
    ]


@router.post("", response_model=FormRead, status_code=status.HTTP_201_CREATED, summary="Create a new form")
async def create_form(payload: FormCreate, db: AsyncSession = Depends(get_db)):
    form = await form_service.create_form(db, payload)
    return form


@router.get("/{form_id}", response_model=FormRead, summary="Get a form with its questions")
async def get_form(form_id: str, db: AsyncSession = Depends(get_db)):
    return await form_service.get_form(db, form_id)


@router.patch("/{form_id}", response_model=FormRead, summary="Update form metadata")
async def update_form(form_id: str, payload: FormUpdate, db: AsyncSession = Depends(get_db)):
    return await form_service.update_form(db, form_id, payload)


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a form")
async def delete_form(form_id: str, db: AsyncSession = Depends(get_db)):
    await form_service.delete_form(db, form_id)


@router.post("/{form_id}/duplicate", response_model=FormRead, status_code=status.HTTP_201_CREATED, summary="Duplicate a form")
async def duplicate_form(form_id: str, db: AsyncSession = Depends(get_db)):
    return await form_service.duplicate_form(db, form_id)


@router.post("/{form_id}/publish", response_model=PublishResponse, summary="Publish a form")
async def publish_form(form_id: str, db: AsyncSession = Depends(get_db)):
    form = await form_service.publish_form(db, form_id)
    return PublishResponse(id=form.id, status=form.status, public_url=f"/to/{form.public_slug}")


@router.post("/{form_id}/unpublish", response_model=FormRead, summary="Unpublish a form")
async def unpublish_form(form_id: str, db: AsyncSession = Depends(get_db)):
    return await form_service.unpublish_form(db, form_id)


@router.post(
    "/{form_id}/questions",
    response_model=QuestionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a question to a form",
)
async def create_question(form_id: str, payload: QuestionCreate, db: AsyncSession = Depends(get_db)):
    return await form_service.create_question(db, form_id, payload)


@router.post(
    "/{form_id}/questions/reorder",
    response_model=list[QuestionRead],
    summary="Reorder a form's questions",
)
async def reorder_questions(form_id: str, payload: ReorderRequest, db: AsyncSession = Depends(get_db)):
    return await form_service.reorder_questions(db, form_id, payload.question_ids)


@questions_router.patch("/{question_id}", response_model=QuestionRead, summary="Update a question")
async def update_question(question_id: str, payload: QuestionUpdate, db: AsyncSession = Depends(get_db)):
    return await form_service.update_question(db, question_id, payload)


@questions_router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a question")
async def delete_question(question_id: str, db: AsyncSession = Depends(get_db)):
    await form_service.delete_question(db, question_id)
