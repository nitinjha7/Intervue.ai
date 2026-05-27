# AI Interviewer

AI Interviewer is a web app that simulates a tough technical interview, captures a live transcript and code, and produces two post-interview reports: an interview critique and a resume review. It is built with Next.js (App Router), Prisma, PostgreSQL, and tRPC, and runs either locally or via Docker Compose.

This README is intentionally detailed so a beginner can understand how the app is structured, how to run it, and how to troubleshoot it.

---

## Table of contents

- Overview
- Core user flow
- Features
- Tech stack
- Project structure
- Routes and pages
- API and data flow
- Database schema
- Environment variables
- Running the app (Docker)
- Running the app (local)
- Scripts
- Common tasks
- Troubleshooting
- Security and privacy notes
- License

---

## Overview

AI Interviewer lets a user:

1) Upload a resume PDF (stored as parsed text).
2) Create an interview based on that resume and a job description.
3) Conduct a live interview with voice input and a code editor.
4) Generate a final report that includes:
   - A direct, critical interview feedback report.
   - A constructive resume review aligned to the job description.

---

## Core user flow

Routes are listed so you can follow the app like a user:

1) Resume vault: `http://localhost:3000/`
   - Upload a resume PDF.
   - Review existing saved resumes.

2) Interview manager: `http://localhost:3000/interview`
   - Create a new interview by selecting a resume, adding job details, and setting duration.
   - See previous interviews and open a session.

3) Interview session: `http://localhost:3000/interview/[id]`
   - Conduct the live interview with transcript, voice, and code editor.
   - When the interview ends, the final report view appears.

---

## Features

- Interview generation
  - Uses resume content, job description, and (optional) cover letter to drive questions.
  - Interviewer persona is strict and direct.

- Live interview workspace
  - Code editor panel.
  - Transcript and conversation feed.
  - Voice recording with silence detection.

- Final report
  - Interview feedback: critical, structured, and direct.
  - Resume review: actionable ATS and formatting improvements.

- Resume vault
  - Stores parsed resume text for interview use.
  - Detail view explains privacy and data handling.

---

## Tech stack

Frontend and core app:
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- shadcn/ui and Radix UI

Data and API:
- Prisma 6
- PostgreSQL 16
- tRPC 11

AI and media:
- OpenAI SDK (chat completions)
- Browser speech recognition (webkitSpeechRecognition)
- Browser speech synthesis

Tooling:
- TypeScript 5
- ESLint 9
- pnpm
- Docker and Docker Compose

---

## Project structure

High-level folders to know:

- `src/app/`
  - App Router pages and API routes.
- `src/components/`
  - UI components and feature layouts.
- `src/components/interview-page/`
  - Live interview workspace and final report UI.
- `src/components/shared/`
  - Markdown and message rendering.
- `src/lib/`
  - OpenAI configuration, prompts, TTS utilities.
- `src/modules/`
  - tRPC procedures for resume and interview logic.
- `src/trpc/`
  - Client/server tRPC plumbing.
- `prisma/`
  - Database schema and migrations.

---

## Routes and pages

- `src/app/page.tsx`
  - Resume vault (upload and list). This is the default route `/`.

- `src/app/resume/page.tsx`
  - Alternate resume vault route at `/resume`.

- `src/app/resume/[id]/page.tsx`
  - Informational page explaining that full resume details are not shown for privacy.

- `src/app/interview/page.tsx`
  - Interview manager page (create and list interviews).

- `src/app/interview/[id]/page.tsx`
  - Interview session page. Hosts the live interview workspace.

- `src/app/api/trpc/[trpc]/route.ts`
  - tRPC API endpoint.

- `src/app/api/inngest/route.ts`
  - Inngest endpoint scaffold (present in the repo).

---

## API and data flow

The main flow uses tRPC and Prisma:

1) Client calls `resumeRouter.addResume` to save parsed resume text.
2) Client calls `interviewRouter.addInterview` to create an interview.
3) Interview workspace calls `interviewRouter.recordUserResponse` with user transcript/code.
4) On completion, the app calls feedback endpoints and stores:
   - `interviewFeedback`
   - `resumeFeedback`

OpenAI calls are made in `src/lib/openai.config.ts` using `gpt-4.1-mini`.

---

## Database schema

Defined in `prisma/schema.prisma`:

- `ResumeData`
  - `id`, `hash`, `title`, `resumeContent`, timestamps.

- `Interview`
  - Foreign key to `ResumeData`.
  - Job details, duration, optional cover letter.
  - Status and timestamps.
  - Stored transcript and final report fields.

`InterviewStatus` enum:
- `pending`
- `goingon`
- `ended`

---

## Environment variables

Required at runtime (Docker or local):

- `DATABASE_URL`
  - PostgreSQL connection string.
  - Example: `postgresql://admin:12345678@db:5432/ai-interviewer`

- `OPENAI_API_KEY`
  - Your OpenAI API key.
  - Must be set before running the app.

If you are using Docker Compose, these are provided in `docker-compose.yml`.

Important: replace the key value with your own and do not commit real keys.

---

## Running the app (Docker)

Prerequisites:
- Docker
- Docker Compose

Steps:

1) Clone and enter the project folder

```bash
git clone https://github.com/MrVineetRaj/ai-interviewer.git
cd ai-interviewer
```

2) Edit `docker-compose.yml`

- Set `OPENAI_API_KEY` to your own key.
- Update database credentials only if you want custom values.

3) Start the stack

```bash
docker-compose up -d --build
```

4) Open the app

- `http://localhost:3000`

5) Stop the stack

```bash
docker-compose down
```

Notes:
- The app container runs `pnpm exec prisma migrate dev` on startup.
- The app uses `next dev --hostname 0.0.0.0` so it can be reached from Docker.

---

## Running the app (local)

Prerequisites:
- Node.js 20+ (recommended)
- pnpm (recommended)
- PostgreSQL 16

Steps:

1) Install dependencies

```bash
pnpm install
```

2) Create a `.env` file in the project root

```env
DATABASE_URL=postgresql://admin:12345678@localhost:5432/ai-interviewer
OPENAI_API_KEY=your_key_here
```

3) Run migrations

```bash
pnpm exec prisma migrate dev
```

4) Start the dev server

```bash
pnpm dev
```

5) Open the app

- `http://localhost:3000`

---

## Scripts

From `package.json`:

- `pnpm dev`
  - Starts Next.js dev server.

- `pnpm build`
  - Builds the production bundle.

- `pnpm start`
  - Starts Next.js in production mode.

- `pnpm lint`
  - Runs ESLint.

---

## Common tasks

### Create a new interview

1) Upload a resume at `/`.
2) Open `/interview`.
3) Click New Interview.
4) Select a resume, fill job details, set duration.
5) Start the interview session at `/interview/[id]`.

### Generate a final report

1) Complete the interview session.
2) The UI will show the final report view automatically when status is `ended`.
3) Use the report actions to generate interview feedback and resume review.

---

## Troubleshooting

### UI does not update

- If running in Docker, rebuild:
  - `docker-compose up -d --build`
- Hard refresh the browser after restart.

### Cannot scroll on interview page

- Ensure the updated versions of:
  - `src/app/interview/[id]/page.tsx`
  - `src/components/interview-page/index.tsx`
  are in your running container.

### Prisma or migration errors

- Make sure Prisma version is 6.15.0 (as pinned in `package.json`).
- Do not use `prisma@latest` for this repo.

### Speech recognition does not work

- The app uses `webkitSpeechRecognition` (Chrome/Edge).
- Allow microphone permissions in the browser.

---

## Security and privacy notes

- Do not commit API keys in `docker-compose.yml` or `.env`.
- The app stores parsed resume text to power interview prompts and feedback.
- Full resume files are not re-rendered in the UI.

---

## License

Add your license information here if needed.
