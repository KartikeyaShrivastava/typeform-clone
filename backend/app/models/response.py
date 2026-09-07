"""FormResponse and Answer models."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class FormResponse(Base):
    __tablename__ = "form_responses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    form_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True
    )
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    completion_time_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_metadata: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)

    form: Mapped["Form"] = relationship("Form", back_populates="responses")
    answers: Mapped[list["Answer"]] = relationship(
        "Answer",
        back_populates="response",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    response_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("form_responses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    answer_value: Mapped[dict | list | str | float | bool | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    response: Mapped["FormResponse"] = relationship("FormResponse", back_populates="answers")
    question: Mapped["Question"] = relationship("Question", back_populates="answers", lazy="selectin")
