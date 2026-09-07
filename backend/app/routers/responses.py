"""Response listing, detail, and statistics endpoints (creator-facing)."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.response import FormStatistics, ResponseDetail, ResponseListPage
from app.services import response_service, statistics_service

router = APIRouter(prefix="/api/forms", tags=["Responses"])


@router.get("/{form_id}/responses", response_model=ResponseListPage, summary="List responses for a form")
async def get_responses(
    form_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await response_service.list_responses(db, form_id, page, limit)


@router.get(
    "/{form_id}/responses/{response_id}",
    response_model=ResponseDetail,
    summary="Get a single response with all answers",
)
async def get_response_detail(form_id: str, response_id: str, db: AsyncSession = Depends(get_db)):
    return await response_service.get_response_detail(db, form_id, response_id)


@router.get("/{form_id}/statistics", response_model=FormStatistics, summary="Get response statistics for a form")
async def get_statistics(form_id: str, db: AsyncSession = Depends(get_db)):
    return await statistics_service.get_form_statistics(db, form_id)
