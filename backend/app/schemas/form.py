"""Pydantic schemas for forms."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.form import FormStatus
from app.schemas.question import PublicQuestionRead, QuestionRead


class FormCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class FormUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    theme_config: dict[str, Any] | None = None
    thank_you_title: str | None = None
    thank_you_message: str | None = None


class FormListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    status: FormStatus
    response_count: int
    created_at: datetime
    updated_at: datetime


class FormRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str | None
    status: FormStatus
    public_slug: str | None
    theme_config: dict[str, Any] | None
    thank_you_title: str | None
    thank_you_message: str | None
    created_at: datetime
    updated_at: datetime
    questions: list[QuestionRead] = []


class PublishResponse(BaseModel):
    id: str
    status: FormStatus
    public_url: str


class PublicFormRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str | None
    thank_you_title: str | None = None
    thank_you_message: str | None = None
    theme_config: dict[str, Any] | None = None
    questions: list[PublicQuestionRead]
