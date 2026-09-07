# Typeform Clone — Backend

Production-quality FastAPI backend for a Typeform-style form builder. Creators build
multi-question forms, publish them as shareable links, and respondents fill them in
one question at a time. Creators can then review individual responses and aggregate
statistics.

This backend is designed to be consumed by a separate Next.js/TypeScript frontend.
It does not render any UI itself.

## Tech Stack

- Python 3.11+
- FastAPI (async)
- SQLAlchemy 2.0 (async engine, `aiosqlite` driver)
- SQLite
- Pydantic v2
- Uvicorn
- Alembic (migrations)
- python-dotenv

## 1. Setup Instructions

### Prerequisites

- Python 3.11 or newer
- pip

### 2. Virtual Environment Setup

Windows (PowerShell):

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
cd backend
python -m venv venv
source venv/bin/activate
```

### 3. Dependency Installation

```bash
pip install -r requirements.txt
```

### 4. Environment Variables

Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

```
DATABASE_URL=sqlite:///./typeform.db
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

- `DATABASE_URL` — sync-style SQLite URL. The app internally converts this to the
  async `sqlite+aiosqlite:///` form; Alembic uses the sync form as-is.
- `FRONTEND_URL` — origin allowed by CORS in addition to `http://localhost:3000`
  (useful for a deployed frontend).
- `ENVIRONMENT` — `development` / `production`, surfaced on the health check.

### 5. Database Initialization (Alembic migrations)

The schema is managed with Alembic. To create the SQLite database file and apply
all migrations:

```bash
alembic upgrade head
```

(The app also auto-creates tables on startup as a convenience for local/dev use,
but Alembic is the source of truth for schema changes — use it when the schema
evolves.)

To generate a new migration after changing a model:

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

### 6. Seed Command

Populate the database with two fully-fledged sample forms (published, with
realistic sample responses) so the app looks functional immediately:

```bash
python -m app.seed
```

Running it again is a no-op if the database already has data.

### 7. Running the Development Server

```bash
uvicorn app.main:app --reload
```

The API is served at `http://127.0.0.1:8000`.

### 8. API Documentation

Interactive Swagger UI: `http://127.0.0.1:8000/docs`
ReDoc: `http://127.0.0.1:8000/redoc`
Raw OpenAPI schema: `http://127.0.0.1:8000/openapi.json`

## 9. Project Architecture

```
backend/
├── app/
│   ├── main.py            FastAPI app, CORS, global exception handlers, router wiring
│   ├── database.py        Async engine/session factory, declarative Base
│   ├── config.py          Environment-driven settings (.env)
│   │
│   ├── models/            SQLAlchemy ORM models (one table per file)
│   │   ├── form.py
│   │   ├── question.py
│   │   └── response.py    FormResponse + Answer
│   │
│   ├── schemas/           Pydantic request/response models
│   │   ├── form.py
│   │   ├── question.py
│   │   └── response.py
│   │
│   ├── routers/           Thin HTTP layer — parses input, calls services, shapes responses
│   │   ├── forms.py       Form CRUD, publish/unpublish, duplicate, question sub-resources
│   │   ├── public.py      Unauthenticated respondent-facing endpoints
│   │   └── responses.py   Response listing/detail + statistics (creator-facing)
│   │
│   ├── services/          Business logic, isolated from HTTP concerns
│   │   ├── form_service.py
│   │   ├── response_service.py
│   │   └── statistics_service.py
│   │
│   ├── utils/
│   │   └── validators.py  Answer validation rules, question-options validation, slug generation
│   │
│   └── seed.py            Seed script (two sample forms + responses)
│
├── alembic/                Migration environment + versions
├── requirements.txt
├── .env.example
├── alembic.ini
└── README.md
```

**Layering:** `router → service → database`. Routers never touch the ORM directly;
they call into `services/`, which own all query/transaction logic. This keeps
endpoints thin and testable, and avoids duplicated business logic across routes.

No authentication/authorization layer exists in this assignment scope — form
management endpoints are open, matching the spec. The `/api/public/*` endpoints
are additionally guaranteed to only ever expose **published** forms.

## 10. Database Schema

SQLite, 4 normalized tables, UUID (string) primary keys, cascade deletes.

```
forms
├── id (PK, uuid)
├── title
├── description (nullable)
├── status            enum: draft | published
├── public_slug       unique, nullable until published
├── theme_config      JSON, nullable
├── thank_you_title   nullable
├── thank_you_message nullable
├── created_at / updated_at

questions
├── id (PK, uuid)
├── form_id (FK -> forms.id, ON DELETE CASCADE)
├── question_text
├── description (nullable)
├── question_type     enum: short_text | long_text | multiple_choice | dropdown
│                            | email | number | yes_no | rating
├── required          bool
├── position           int  (0-based, contiguous per form)
├── options            JSON list[str], required for multiple_choice/dropdown
├── settings           JSON, e.g. {"max": 5, "icon": "star"} for rating
├── created_at / updated_at

form_responses
├── id (PK, uuid)
├── form_id (FK -> forms.id, ON DELETE CASCADE)
├── submitted_at
├── completion_time_seconds (nullable)
├── metadata           JSON, nullable (stored in the "metadata" column; the ORM
│                       attribute is named response_metadata since "metadata" is
│                       reserved by SQLAlchemy's declarative base)

answers
├── id (PK, uuid)
├── response_id (FK -> form_responses.id, ON DELETE CASCADE)
├── question_id (FK -> questions.id, ON DELETE CASCADE)
├── answer_value       JSON (string / number / bool / list depending on question type)
├── created_at
```

Relationships:

```
Form 1---* Question
Form 1---* FormResponse 1---* Answer *---1 Question
```

Deleting a `Form` cascades to its `Question`s and `FormResponse`s (which in turn
cascades to `Answer`s). Deleting a `Question` cascades to its `Answer`s.

## API Overview

All endpoints are namespaced under `/api`. See `/docs` for the full interactive
contract (request/response models, status codes, examples). High level:

- `GET/POST /api/forms`, `GET/PATCH/DELETE /api/forms/{id}`
- `POST /api/forms/{id}/duplicate`
- `POST /api/forms/{id}/publish` / `POST /api/forms/{id}/unpublish`
- `POST /api/forms/{id}/questions`, `POST /api/forms/{id}/questions/reorder`
- `PATCH/DELETE /api/questions/{id}`
- `GET /api/public/forms/{slug}` (published forms only, 404 otherwise)
- `POST /api/public/forms/{slug}/responses` (validates every answer server-side)
- `GET /api/forms/{id}/responses` (paginated), `GET /api/forms/{id}/responses/{response_id}`
- `GET /api/forms/{id}/statistics`

Errors are always returned as `{"detail": ...}` with the appropriate HTTP status
code (400/404/422/500); stack traces are never leaked to the client.
