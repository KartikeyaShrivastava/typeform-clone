"""Form model."""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class FormStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class Form(Base):
    __tablename__ = "forms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[FormStatus] = mapped_column(
        Enum(FormStatus, native_enum=False, length=20), nullable=False, default=FormStatus.DRAFT
    )
    public_slug: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True, index=True)
    theme_config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    thank_you_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    thank_you_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    questions: Mapped[list["Question"]] = relationship(
        "Question",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Question.position",
        lazy="selectin",
    )
    responses: Mapped[list["FormResponse"]] = relationship(
        "FormResponse",
        back_populates="form",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
