"""Shared validation helpers: answer validation and slug generation."""
import re
import secrets
import string

from fastapi import HTTPException, status

from app.models.question import Question, QuestionType

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class AnswerValidationError(ValueError):
    """Raised when a submitted answer fails validation for its question."""

    def __init__(self, question_id: str, message: str):
        self.question_id = question_id
        self.message = message
        super().__init__(message)


def _is_empty(value) -> bool:
    if value is None:
        return True
    if isinstance(value, str) and value.strip() == "":
        return True
    if isinstance(value, (list, dict)) and len(value) == 0:
        return True
    return False


def validate_answer_value(question: Question, value) -> None:
    """Validate a single answer value against its question's type/settings.

    Raises AnswerValidationError with a human-readable message on failure.
    """
    if question.required and _is_empty(value):
        raise AnswerValidationError(question.id, f"'{question.question_text}' is required")

    if _is_empty(value):
        return

    qtype = question.question_type

    if qtype in (QuestionType.SHORT_TEXT, QuestionType.LONG_TEXT):
        if not isinstance(value, str):
            raise AnswerValidationError(question.id, f"'{question.question_text}' must be text")

    elif qtype == QuestionType.EMAIL:
        if not isinstance(value, str) or not EMAIL_RE.match(value.strip()):
            raise AnswerValidationError(question.id, f"'{question.question_text}' must be a valid email address")

    elif qtype == QuestionType.NUMBER:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            try:
                float(value)
            except (TypeError, ValueError):
                raise AnswerValidationError(question.id, f"'{question.question_text}' must be a number")

    elif qtype == QuestionType.MULTIPLE_CHOICE:
        options = question.options or []
        if value not in options:
            raise AnswerValidationError(
                question.id, f"'{question.question_text}' must be one of: {', '.join(options)}"
            )

    elif qtype == QuestionType.DROPDOWN:
        options = question.options or []
        if value not in options:
            raise AnswerValidationError(
                question.id, f"'{question.question_text}' must be one of: {', '.join(options)}"
            )

    elif qtype == QuestionType.YES_NO:
        if not isinstance(value, bool):
            raise AnswerValidationError(question.id, f"'{question.question_text}' must be true or false")

    elif qtype == QuestionType.RATING:
        settings = question.settings or {}
        max_rating = settings.get("max", 5)
        min_rating = settings.get("min", 1)
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise AnswerValidationError(question.id, f"'{question.question_text}' must be a number")
        if value < min_rating or value > max_rating:
            raise AnswerValidationError(
                question.id,
                f"'{question.question_text}' must be between {min_rating} and {max_rating}",
            )


def validate_question_options(question_type: QuestionType, options: list[str] | None) -> None:
    if question_type in (QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN):
        if not options or len(options) == 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"'{question_type.value}' questions require a non-empty 'options' list",
            )


def generate_slug(length: int = 8) -> str:
    alphabet = string.ascii_lowercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))
