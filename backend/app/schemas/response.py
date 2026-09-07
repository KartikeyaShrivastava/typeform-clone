"""Pydantic schemas for responses, answers and statistics."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.question import QuestionType


class AnswerSubmit(BaseModel):
    question_id: str
    answer_value: Any = None


class ResponseSubmit(BaseModel):
    completion_time_seconds: int | None = Field(None, ge=0)
    answers: list[AnswerSubmit] = []
    metadata: dict[str, Any] | None = None


class AnswerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_id: str
    answer_value: Any


class AnswerWithQuestion(BaseModel):
    question_id: str
    question_text: str
    question_type: QuestionType
    answer_value: Any


class ResponseSubmitResult(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime


class ResponseListItem(BaseModel):
    id: str
    submitted_at: datetime
    completion_time_seconds: int | None
    answer_preview: str | None


class ResponseListPage(BaseModel):
    items: list[ResponseListItem]
    total: int
    page: int
    limit: int
    total_pages: int


class ResponseDetail(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    completion_time_seconds: int | None
    metadata: dict[str, Any] | None
    answers: list[AnswerWithQuestion]


class ChoiceStatistics(BaseModel):
    counts: dict[str, int]


class RatingStatistics(BaseModel):
    average: float | None
    distribution: dict[str, int]


class YesNoStatistics(BaseModel):
    true_count: int
    false_count: int


class NumberStatistics(BaseModel):
    min: float | None
    max: float | None
    average: float | None


class TextStatistics(BaseModel):
    answered_count: int
    recent_answers: list[str]


class QuestionStatistics(BaseModel):
    question_id: str
    question_text: str
    question_type: QuestionType
    statistics: dict[str, Any]


class FormStatistics(BaseModel):
    total_responses: int
    average_completion_seconds: float | None = None
    questions: list[QuestionStatistics]
