"""Seed the database with sample forms and responses.

Run with:
    python -m app.seed
"""
import asyncio
import random
from datetime import datetime, timedelta

from sqlalchemy import select

from app.database import AsyncSessionLocal, init_db
from app.models.form import Form, FormStatus
from app.models.question import Question, QuestionType
from app.models.response import Answer, FormResponse
from app.utils.validators import generate_slug


async def _unique_slug(db) -> str:
    slug = generate_slug()
    while (await db.execute(select(Form).where(Form.public_slug == slug))).scalar_one_or_none():
        slug = generate_slug()
    return slug


async def seed_customer_feedback_form(db) -> Form:
    form = Form(
        title="Customer Feedback Survey",
        description="Help us improve by sharing your experience with our product.",
        status=FormStatus.PUBLISHED,
        public_slug=await _unique_slug(db),
        thank_you_title="Thanks for your feedback!",
        thank_you_message="We really appreciate you taking the time to help us improve.",
    )
    db.add(form)
    await db.flush()

    q_name = Question(
        form_id=form.id,
        question_text="What is your name?",
        question_type=QuestionType.SHORT_TEXT,
        required=True,
        position=0,
    )
    q_email = Question(
        form_id=form.id,
        question_text="What is your email?",
        question_type=QuestionType.EMAIL,
        required=True,
        position=1,
    )
    q_satisfaction = Question(
        form_id=form.id,
        question_text="How satisfied are you?",
        question_type=QuestionType.RATING,
        required=True,
        settings={"max_rating": 5},
        position=2,
    )
    q_feature = Question(
        form_id=form.id,
        question_text="What feature do you like most?",
        question_type=QuestionType.MULTIPLE_CHOICE,
        required=True,
        options=["Ease of use", "Customer support", "Pricing", "Integrations", "Performance"],
        position=3,
    )
    q_feedback = Question(
        form_id=form.id,
        question_text="Additional feedback?",
        description="Anything else you'd like us to know?",
        question_type=QuestionType.LONG_TEXT,
        required=False,
        position=4,
    )
    db.add_all([q_name, q_email, q_satisfaction, q_feature, q_feedback])
    await db.flush()

    sample_people = [
        ("Alice Johnson", "alice.johnson@example.com", 5, "Ease of use", "Love how intuitive everything is!"),
        ("Brian Chen", "brian.chen@example.com", 4, "Customer support", "Support team resolved my issue quickly."),
        ("Carla Gomez", "carla.gomez@example.com", 3, "Pricing", "Good value, but a bit pricey for small teams."),
        ("David Smith", "david.smith@example.com", 5, "Integrations", "The Slack integration is a game changer."),
        ("Emma Wilson", "emma.wilson@example.com", 4, "Performance", "Fast and reliable, no complaints."),
        ("Farid Hassan", "farid.hassan@example.com", 2, "Pricing", "Would like more affordable plans."),
    ]

    for i, (name, email, rating, feature, feedback) in enumerate(sample_people):
        response = FormResponse(
            form_id=form.id,
            submitted_at=datetime.utcnow() - timedelta(days=len(sample_people) - i),
            completion_time_seconds=random.randint(30, 180),
        )
        db.add(response)
        await db.flush()

        db.add_all(
            [
                Answer(response_id=response.id, question_id=q_name.id, answer_value=name),
                Answer(response_id=response.id, question_id=q_email.id, answer_value=email),
                Answer(response_id=response.id, question_id=q_satisfaction.id, answer_value=rating),
                Answer(response_id=response.id, question_id=q_feature.id, answer_value=feature),
                Answer(response_id=response.id, question_id=q_feedback.id, answer_value=feedback),
            ]
        )

    await db.flush()
    return form


async def seed_developer_experience_form(db) -> Form:
    form = Form(
        title="Developer Experience Survey",
        description="Tell us about your day-to-day experience as a developer on our platform.",
        status=FormStatus.PUBLISHED,
        public_slug=await _unique_slug(db),
        thank_you_title="Thanks for sharing!",
        thank_you_message="Your input helps us build a better developer experience.",
    )
    db.add(form)
    await db.flush()

    q_language = Question(
        form_id=form.id,
        question_text="What is your primary programming language?",
        question_type=QuestionType.DROPDOWN,
        required=True,
        options=["Python", "JavaScript", "TypeScript", "Go", "Java", "Rust"],
        position=0,
    )
    q_uses_ci = Question(
        form_id=form.id,
        question_text="Do you use continuous integration (CI)?",
        question_type=QuestionType.YES_NO,
        required=True,
        position=1,
    )
    q_team_size = Question(
        form_id=form.id,
        question_text="How many people are on your team?",
        question_type=QuestionType.NUMBER,
        required=True,
        position=2,
    )
    q_pain_points = Question(
        form_id=form.id,
        question_text="What is your biggest pain point when building software?",
        question_type=QuestionType.LONG_TEXT,
        required=False,
        position=3,
    )
    db.add_all([q_language, q_uses_ci, q_team_size, q_pain_points])
    await db.flush()

    sample_devs = [
        ("TypeScript", True, 5, "Debugging flaky end-to-end tests takes forever."),
        ("Python", True, 8, "Keeping dependency versions in sync across services."),
        ("Go", False, 3, "Lack of good local development tooling."),
        ("JavaScript", True, 12, "Onboarding new engineers to the codebase."),
        ("Rust", True, 2, "Compile times can slow down iteration speed."),
    ]

    for i, (language, uses_ci, team_size, pain_point) in enumerate(sample_devs):
        response = FormResponse(
            form_id=form.id,
            submitted_at=datetime.utcnow() - timedelta(days=len(sample_devs) - i),
            completion_time_seconds=random.randint(20, 120),
        )
        db.add(response)
        await db.flush()

        db.add_all(
            [
                Answer(response_id=response.id, question_id=q_language.id, answer_value=language),
                Answer(response_id=response.id, question_id=q_uses_ci.id, answer_value=uses_ci),
                Answer(response_id=response.id, question_id=q_team_size.id, answer_value=team_size),
                Answer(response_id=response.id, question_id=q_pain_points.id, answer_value=pain_point),
            ]
        )

    await db.flush()
    return form


async def seed() -> None:
    await init_db()

    async with AsyncSessionLocal() as db:
        existing = (await db.execute(select(Form))).scalars().first()
        if existing:
            print("Database already contains data. Skipping seed.")
            return

        form1 = await seed_customer_feedback_form(db)
        form2 = await seed_developer_experience_form(db)
        await db.commit()

        print("Seed complete:")
        print(f"  - {form1.title} -> /to/{form1.public_slug}")
        print(f"  - {form2.title} -> /to/{form2.public_slug}")


if __name__ == "__main__":
    asyncio.run(seed())
