"""Public, unauthenticated endpoints used by the form-filling respondent UI."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.form import PublicFormRead
from app.schemas.response import ResponseSubmit, ResponseSubmitResult
from app.services import response_service

router = APIRouter(prefix="/api/public", tags=["Public"])


@router.get("/forms/{slug}", response_model=PublicFormRead, summary="Get a published form for filling")
async def get_public_form(slug: str, db: AsyncSession = Depends(get_db)):
    form = await response_service.get_published_form_by_slug(db, slug)
    return form


@router.post(
    "/forms/{slug}/responses",
    response_model=ResponseSubmitResult,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a response to a published form",
)
async def submit_response(slug: str, payload: ResponseSubmit, db: AsyncSession = Depends(get_db)):
    response = await response_service.submit_response(db, slug, payload)
    return ResponseSubmitResult(id=response.id, form_id=response.form_id, submitted_at=response.submitted_at)
