# Formly — Typeform-style form builder (frontend)

A production-quality Next.js frontend for a conversational form builder, built to integrate
with an existing FastAPI backend. Dark theme, editorial type (Fraunces + Inter), one warm
accent color.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (dark theme via CSS variables / design tokens)
- Radix UI primitives (dialog, dropdown, tabs, select, switch, toast) styled from scratch
- Framer Motion for transitions
- dnd-kit for drag-and-drop question reordering
- TanStack Query for data fetching, caching, and optimistic updates
- Axios for the API client
- React Hook Form + Zod available for form validation where useful
- Lucide React icons

## Getting started

```bash
npm install
cp .env.local.example .env.local
# edit .env.local if your API isn't at http://localhost:8000/api
npm run dev
```

The app runs at `http://localhost:3000`. It expects a FastAPI backend implementing the
contract described below, reachable at `NEXT_PUBLIC_API_URL`.

### Build

```bash
npm run build
npm run start
```

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend | `http://localhost:8000/api` |

All API calls go through `lib/api.ts`, which reads this variable — no URLs are hardcoded
inside components.

## Architecture

```
app/
  page.tsx                      Landing page
  forms/page.tsx                Dashboard — list, search, create, rename, duplicate, delete
  forms/[id]/edit/page.tsx      Form builder (question list, config panel, autosave, preview)
  forms/[id]/results/page.tsx   Results — responses table + summary/statistics
  to/[slug]/page.tsx            Public, one-question-at-a-time respondent experience

components/
  dashboard/     Form cards, empty state, rename dialog
  builder/       Type sidebar, sortable question list/card, config panel, settings/share
                 dialogs, save-status indicator, preview wrapper
  respondent/    Question type renderer, progress bar, the shared "form runner" flow,
                 thank-you screen — reused by both /to/[slug] and the builder's Preview tab
  results/       Responses table, response detail dialog, summary visualizations
  ui/            Small style-agnostic primitives (button, input, dialog, tabs, select, ...)
  shared/        Logo, navbar

lib/
  api.ts         Axios client + one function per API endpoint
  types.ts       Shared TypeScript types matching the API contract
  utils.ts       Formatting helpers (dates, pluralization, cn())
  question-types.ts  Question type metadata (icons, labels) used by the builder

hooks/
  use-forms.ts       useForms, useForm, useCreateForm, useUpdateForm, useDeleteForm,
                      useDuplicateForm, usePublishForm
  use-questions.ts   useCreateQuestion, useUpdateQuestion, useDeleteQuestion,
                      useReorderQuestions (all with optimistic cache updates)
  use-responses.ts   useResponses, useResponse, useStatistics
  use-debounced-callback.ts   Generic debounce hook, used for builder autosave

providers/
  query-provider.tsx   TanStack Query client
  toast-provider.tsx   Toast notifications (Radix Toast under the hood)
```

## Design notes

- **Palette**: near-black ink background (`#0A0C11`), layered surfaces, one warm accent
  (`#FF6B45`, "ember") for primary actions and progress, a periwinkle secondary for
  informational accents. Configurable per-form via Settings → Theme (`theme_config.primary_color`),
  applied on the public respondent page.
- **Type**: Fraunces (serif) for questions and headlines, Inter for UI chrome — gives the
  form-filling experience a warmer, more conversational feel than a typical admin dashboard.
- **Autosave**: form title and question edits are optimistically applied to the local
  TanStack Query cache immediately, then written to the API on a debounce (500–600ms), with
  a "Saving… / Saved" indicator in the builder navbar.
- **Respondent flow**: `components/respondent/form-runner.tsx` renders one question at a
  time, handles keyboard navigation (Enter to advance, Cmd/Ctrl+Enter for long text),
  client-side validation (required, email, number), animated transitions, and calls the same
  code path from both the live public form and the builder's Preview tab (the preview never
  calls the submit endpoint).

## API contract

All requests are relative to `NEXT_PUBLIC_API_URL`.

```
GET    /forms
POST   /forms
GET    /forms/{form_id}
PATCH  /forms/{form_id}
DELETE /forms/{form_id}
POST   /forms/{form_id}/duplicate
POST   /forms/{form_id}/publish
POST   /forms/{form_id}/unpublish

POST   /forms/{form_id}/questions
PATCH  /questions/{question_id}
DELETE /questions/{question_id}
POST   /forms/{form_id}/questions/reorder      { question_ids: string[] }

GET    /public/forms/{slug}
POST   /public/forms/{slug}/responses

GET    /forms/{form_id}/responses
GET    /forms/{form_id}/responses/{response_id}
GET    /forms/{form_id}/statistics
```

See `lib/types.ts` for the exact request/response shapes the frontend expects. `GET /forms/{id}/responses`
is read as either a bare array or `{ items, total }` — adjust `lib/api.ts#listResponses` if your
backend's pagination shape differs.

## Testing checklist

Create form · rename · add every question type · edit questions · add options · toggle
required · drag reorder · delete question · duplicate form · publish · open public URL ·
fill form · keyboard navigation · validation · submit response · view response · view
statistics · unpublish.
