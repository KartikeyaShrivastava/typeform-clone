"""Question model."""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class QuestionType(str, enum.Enum):
    SHORT_TEXT = "short_text"
    LONG_TEXT = "long_text"
    MULTIPLE_CHOICE = "multiple_choice"
    DROPDOWN = "dropdown"
    EMAIL = "email"
    NUMBER = "number"
    YES_NO = "yes_no"
    RATING = "rating"


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    form_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_text: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    question_type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType, native_enum=False, length=30), nullable=False
    )
    required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    options: Mapped[list | None] = mapped_column(JSON, nullable=True)
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    form: Mapped["Form"] = relationship("Form", back_populates="questions")
    answers: Mapped[list["Answer"]] = relationship(
        "Answer", back_populates="question", cascade="all, delete-orphan"
    )
