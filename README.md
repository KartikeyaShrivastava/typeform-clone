# Formly — Typeform Clone

A full-stack Typeform clone with a conversational form builder, one-question-at-a-time respondent experience, drag-and-drop form editor, and response analytics — all within a polished dark-themed interface.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI, Framer Motion, dnd-kit, TanStack Query, Axios |
| **Backend** | Python 3.11+, FastAPI (async), SQLAlchemy 2.0, Pydantic v2, Uvicorn |
| **Database** | SQLite with Alembic migrations |

## Quick Start

### Prerequisites
- **Node.js** 18+ & npm
- **Python** 3.11+

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m app.seed          # Seeds 2 sample forms with responses
uvicorn app.main:app --reload
```

The API runs at **http://localhost:8000**. Interactive docs at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The app runs at **http://localhost:3000**.

## Features

### ✅ Core Features (Implemented)

**Form Builder**
- Create forms with title and ordered list of questions
- Add, edit, reorder (drag-and-drop), and delete questions
- 8 question types: short text, long text, multiple choice, dropdown, email, number, yes/no, rating
- Per-question settings: required toggle, description/help text
- Live preview of the form within the builder
- Autosave with optimistic updates and visual status indicator

**Form Management (CRUD)**
- Dashboard with all forms, status indicators, and response counts
- Create, rename, duplicate, and delete forms
- Publish / unpublish with shareable public links
- Real-time search filtering

**Respondent Flow (Typeform Experience)**
- One question at a time, full-screen, with smooth animated transitions
- Keyboard navigation (Enter to advance, Cmd/Ctrl+Enter for long text)
- Progress indicator bar
- Client-side + server-side validation (required, email, number, options, rating bounds)
- Submit stores the response; animated thank-you screen
- No login required to fill a published form

**Results / Responses**
- Per-form paginated responses table
- Individual response detail modal
- Summary statistics per question type:
  - Multiple choice / dropdown: option count bars
  - Yes/No: percentage breakdown
  - Rating: average score + distribution chart
  - Number: min, max, average
  - Text: response count + recent answers
- Average completion time

**Typeform Experience**
- Distinctive conversational one-at-a-time fill UI with direction-aware transitions
- Clean builder layout with live preview
- Inline editing, modals, and toasts
- Settings: custom theme colors, thank-you screen customization
- Dark editorial theme (Fraunces + Inter typography)

### 🔲 Placeholder Sections
- Logic jumps / branching (Settings → Logic tab shows "Coming Soon")
- Integrations / webhooks
- Team collaboration & sharing
- Payment / file-upload question types
- Authentication (assumes a default logged-in creator per spec)

### 🎁 Bonus Features
- ✅ Custom themes (primary accent color per form)
- ✅ Dark mode (default)

## Architecture

```
project/
├── frontend/                  Next.js 14 App Router
│   ├── app/
│   │   ├── page.tsx           Landing page
│   │   ├── forms/page.tsx     Dashboard
│   │   ├── forms/[id]/edit/   Form builder
│   │   ├── forms/[id]/results/ Response analytics
│   │   └── to/[slug]/         Public respondent page
│   ├── components/
│   │   ├── builder/           Builder UI (navbar, sidebar, question cards, config panel)
│   │   ├── dashboard/         Form cards, empty state, rename dialog
│   │   ├── respondent/        Form runner, question views, progress bar, thank-you
│   │   ├── results/           Responses table, detail dialog, summary charts
│   │   ├── shared/            Logo, navbar
│   │   └── ui/                Radix-based primitives
│   ├── hooks/                 React Query hooks with optimistic updates
│   ├── lib/                   API client, types, utilities
│   └── providers/             Query + toast context providers
│
├── backend/                   FastAPI (Python)
│   ├── app/
│   │   ├── main.py            App entry, CORS, exception handlers
│   │   ├── config.py          Environment settings
│   │   ├── database.py        Async SQLAlchemy engine
│   │   ├── models/            ORM models (Form, Question, FormResponse, Answer)
│   │   ├── schemas/           Pydantic request/response models
│   │   ├── routers/           HTTP endpoints (forms, public, responses)
│   │   ├── services/          Business logic layer
│   │   ├── utils/             Validators, slug generator
│   │   └── seed.py            Sample data seeder
│   └── alembic/               Database migrations
│
└── README.md                  This file
```

**Layering:** `Router → Service → Database`. Routers never touch the ORM directly; they call into services, which own all query/transaction logic.

## Database Schema

SQLite with 4 normalized tables, UUID primary keys, and cascade deletes.

```
forms
├── id (PK, uuid)
├── title
├── description (nullable)
├── status                 enum: draft | published
├── public_slug            unique, nullable until published
├── theme_config           JSON (accent colors, fonts)
├── thank_you_title        nullable
├── thank_you_message      nullable
├── created_at / updated_at

questions
├── id (PK, uuid)
├── form_id (FK → forms.id, ON DELETE CASCADE)
├── question_text
├── description (nullable)
├── question_type          enum: short_text | long_text | multiple_choice |
│                                dropdown | email | number | yes_no | rating
├── required               boolean
├── position               int (0-based, contiguous per form)
├── options                JSON list[str] (for multiple_choice / dropdown)
├── settings               JSON (e.g. {"max": 5, "icon": "star"} for rating)
├── created_at / updated_at

form_responses
├── id (PK, uuid)
├── form_id (FK → forms.id, ON DELETE CASCADE)
├── submitted_at
├── completion_time_seconds (nullable)
├── metadata               JSON (nullable)

answers
├── id (PK, uuid)
├── response_id (FK → form_responses.id, ON DELETE CASCADE)
├── question_id (FK → questions.id, ON DELETE CASCADE)
├── answer_value           JSON (string / number / bool / list)
├── created_at
```

**Relationships:**
```
Form 1───* Question
Form 1───* FormResponse 1───* Answer *───1 Question
```

## API Overview

All endpoints prefixed with `/api`. Full interactive docs at `/docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/forms` | List all forms with response counts |
| `POST` | `/forms` | Create a new form |
| `GET` | `/forms/{id}` | Get form with questions |
| `PATCH` | `/forms/{id}` | Update form metadata |
| `DELETE` | `/forms/{id}` | Delete form (cascade) |
| `POST` | `/forms/{id}/duplicate` | Duplicate form + questions |
| `POST` | `/forms/{id}/publish` | Publish & generate public slug |
| `POST` | `/forms/{id}/unpublish` | Revert to draft |
| `POST` | `/forms/{id}/questions` | Add question |
| `PATCH` | `/questions/{id}` | Update question |
| `DELETE` | `/questions/{id}` | Delete question |
| `POST` | `/forms/{id}/questions/reorder` | Reorder questions |
| `GET` | `/public/forms/{slug}` | Get published form (no auth) |
| `POST` | `/public/forms/{slug}/responses` | Submit response (validated) |
| `GET` | `/forms/{id}/responses` | Paginated responses list |
| `GET` | `/forms/{id}/responses/{rid}` | Individual response detail |
| `GET` | `/forms/{id}/statistics` | Aggregated question statistics |

## Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./typeform.db` | SQLite connection string |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `ENVIRONMENT` | `development` | Environment name |

### Frontend (`frontend/.env.local`)
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Backend API base URL |

## Assumptions

- No real authentication — assumes a single default creator per the assignment spec
- SQLite for simplicity; the async SQLAlchemy setup supports PostgreSQL with minimal changes
- Public form filling requires no login (accessible via `/to/{slug}`)
- Form responses persist permanently (no TTL or cleanup)
