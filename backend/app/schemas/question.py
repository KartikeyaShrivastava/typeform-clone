"""Pydantic schemas for questions."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.question import QuestionType


class QuestionBase(BaseModel):
    question_text: str = Field(default="", min_length=0, max_length=500)
    description: str | None = None
    question_type: QuestionType
    required: bool = False
    options: list[str] | None = None
    settings: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_options_for_choice_types(self):
        if self.question_type in (QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN):
            if not self.options or len(self.options) == 0:
                raise ValueError(
                    f"'{self.question_type.value}' questions require a non-empty 'options' list"
                )
        return self


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    question_text: str | None = Field(None, min_length=0, max_length=500)
    description: str | None = None
    question_type: QuestionType | None = None
    required: bool | None = None
    options: list[str] | None = None
    settings: dict[str, Any] | None = None


class QuestionRead(QuestionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    form_id: str
    position: int
    created_at: datetime
    updated_at: datetime


class PublicQuestionRead(BaseModel):
    """Question shape exposed on the public form-fill endpoint (no internal settings leak)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    question_text: str
    description: str | None
    question_type: QuestionType
    required: bool
    options: list[str] | None
    settings: dict[str, Any] | None
    position: int


class ReorderRequest(BaseModel):
    question_ids: list[str] = Field(..., min_length=1)
