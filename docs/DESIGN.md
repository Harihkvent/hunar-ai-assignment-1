# Hunar AI — Assignment 1: AI Hiring Assistant

## 1. Assignment Scope

Build a web application for an HR/recruiter to configure a job, initiate an AI-powered voice screening interview with a candidate, capture the conversation, evaluate the candidate, and review the result in a hiring dashboard.

The implementation must demonstrate integration with Hunar.AI Voice AI Agents and follow the requested technology stack:

- Python
- Node.js (permitted by the brief; Python is preferred for backend)
- TypeScript (plain JavaScript should not be used)
- React.js
- Next.js
- shadcn/ui
- Python preferred for the backend

Submission requirements:
- Deployed solution link
- GitHub repository containing source code

Security requirement:
- The Hunar API key must be kept secret and must not be committed to the public repository.
- The assignment email states that the supplied API key will be revoked after 3 days.

Deadline:
- September 7, 2026 at 4:37 PM IST

## 2. Product Goal

Create a focused AI hiring workflow that reduces repetitive first-round screening effort while giving HR a clear, auditable view of candidate responses and AI-generated screening results.

Core product story:

Job -> Candidate -> Voice Screening -> Transcript -> Structured Evaluation -> HR Decision Dashboard

## 3. Explicit Requirements From the Brief

### Functional
1. Build an AI Hiring Assistant web application.
2. Use Hunar.AI Voice AI Agents / Voice AI APIs.
3. Design the workflow around hiring/screening use cases.
4. Other communication platforms may be added when they improve the solution design, but they are optional.
5. Provide a deployed application.
6. Provide the source code in GitHub.

### Technology
1. Python is preferred for the backend.
2. TypeScript must be used instead of plain JavaScript.
3. Use React.js and Next.js for the web application.
4. Use shadcn/ui for the UI component layer.
5. Node.js may be used where useful, but it should not displace the preferred Python backend without a reason.

### Security
1. Never expose the Hunar API key in client-side code.
2. Do not hard-code the API key.
3. Store secrets in environment variables / deployment secrets.
4. Ensure secrets are excluded from Git history and repository contents.

## 4. Proposed MVP

### HR workflow
1. HR creates a job.
2. HR defines job description, required skills, experience range, and screening focus.
3. HR adds or imports a candidate for that job.
4. HR launches an AI voice screening session.
5. AI conducts a structured first-round screening conversation.
6. Conversation transcript and relevant metadata are stored.
7. A post-interview evaluator converts the conversation into structured hiring signals.
8. HR reviews the candidate score, strengths, concerns, transcript, and recommendation.
9. HR can mark the candidate as Shortlisted, Rejected, or Needs Review.

### Candidate experience
- Clear consent / interview-introduction step.
- Microphone permission handling.
- Voice conversation using the Hunar Voice AI integration.
- One-question-at-a-time interview flow.
- Graceful handling of network, microphone, or provider errors.
- End-of-interview completion state.

## 5. Recommended Product Screens

### 5.1 Overview Dashboard
Show:
- Active jobs
- Candidates screened
- Interviews completed
- Shortlisted candidates
- Candidates needing review
- Recent interviews

### 5.2 Jobs
List and filter jobs.
Create a new job with:
- Job title
- Job description
- Required skills
- Preferred skills
- Experience range
- Interview focus / criteria

### 5.3 Job Detail
For one job:
- Job summary
- Required criteria
- Candidate list
- Screening statistics
- Start candidate interview action

### 5.4 Candidate Detail
Show:
- Candidate profile basics
- Job applied for
- Interview status
- Interview date/time
- Overall score
- Skill scores
- Communication score
- Strengths
- Concerns / gaps
- Recommendation
- Transcript

### 5.5 AI Voice Interview
Show:
- Candidate name
- Job title
- Interview status
- Microphone state
- Conversation state
- Current interaction status
- End interview action
- Error/retry state

### 5.6 Evaluation View
Show a structured result such as:
- Overall score
- Technical skills
- Communication
- Problem solving
- Relevant experience
- Strengths
- Risks / missing requirements
- Final recommendation

### 5.7 Settings / Integration Health (optional but useful)
- Provider connection status
- Environment/config status without exposing secrets
- Recent integration errors

## 6. High-Level Architecture

```text
                         ┌───────────────────────┐
                         │       HR / User       │
                         └───────────┬───────────┘
                                     │
                                     ▼
                    ┌───────────────────────────────┐
                    │ Next.js + React + TypeScript  │
                    │ shadcn/ui                     │
                    └──────────────┬────────────────┘
                                   │ HTTPS / JSON
                                   ▼
                    ┌───────────────────────────────┐
                    │ Python FastAPI Backend        │
                    │                               │
                    │ - Jobs                        │
                    │ - Candidates                   │
                    │ - Interviews                   │
                    │ - Evaluations                  │
                    │ - Hunar integration            │
                    └──────────────┬────────────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
   ┌─────────────────┐   ┌─────────────────┐   ┌──────────────────┐
   │ Database        │   │ Hunar Voice API │   │ Evaluation Layer │
   │                 │   │ / Voice Agent   │   │                  │
   │ Jobs            │   │                 │   │ LLM / rules      │
   │ Candidates      │   │ Voice session   │   │ -> structured    │
   │ Interviews      │   │ Transcript      │   │    result        │
   │ Evaluations     │   │ Events/status   │   │                  │
   └─────────────────┘   └─────────────────┘   └──────────────────┘
```

## 7. Backend Responsibilities

Use FastAPI and keep provider-specific logic isolated behind a service layer.

Suggested modules:

```text
backend/
  app/
    api/
      jobs.py
      candidates.py
      interviews.py
      evaluations.py
    services/
      hunar_voice.py
      interview_service.py
      evaluation_service.py
    models/
      job.py
      candidate.py
      interview.py
      evaluation.py
    schemas/
      job.py
      candidate.py
      interview.py
      evaluation.py
    core/
      config.py
      security.py
    main.py
```

The frontend should never need the Hunar secret directly. The FastAPI service is the trust boundary for provider credentials and server-side calls.

## 8. Frontend Structure

Suggested structure:

```text
frontend/
  app/
    dashboard/
    jobs/
    candidates/
    interviews/
    globals.css
    layout.tsx
    page.tsx
  components/
    ui/                 # shadcn/ui
    dashboard/
    jobs/
    candidates/
    interviews/
  lib/
    api.ts
    types.ts
```

Use TypeScript throughout.

## 9. Core Data Model

### Job
- id
- title
- description
- required_skills[]
- preferred_skills[]
- experience_min
- experience_max
- interview_criteria[]
- created_at
- updated_at

### Candidate
- id
- job_id
- name
- email (optional for demo)
- phone (optional for demo)
- resume_reference (optional)
- status
- created_at

### Interview
- id
- candidate_id
- job_id
- provider
- provider_session_id
- status
- started_at
- ended_at
- transcript
- metadata

### Evaluation
- id
- interview_id
- overall_score
- technical_score
- communication_score
- problem_solving_score
- experience_score
- strengths[]
- concerns[]
- recommendation
- reasoning_summary
- created_at

## 10. Suggested API Contract

The exact Hunar provider endpoints must be implemented only after validating the supplied API documentation. Keep our own application API stable even if provider details change.

Example application endpoints:

```text
GET    /api/jobs
POST   /api/jobs
GET    /api/jobs/{job_id}

GET    /api/jobs/{job_id}/candidates
POST   /api/jobs/{job_id}/candidates
GET    /api/candidates/{candidate_id}

POST   /api/interviews
GET    /api/interviews/{interview_id}
POST   /api/interviews/{interview_id}/complete

GET    /api/evaluations/{interview_id}
POST   /api/evaluations/{interview_id}/generate
```

Provider details must remain behind `hunar_voice.py` or an equivalent adapter.

## 11. Interview Design

The interview should be generated from the job definition rather than hard-coded for only one job.

Example screening dimensions:
- Role knowledge
- Required technical skills
- Problem solving
- Relevant project/work experience
- Communication clarity
- Availability / practical fit where appropriate

Conversation rules:
- Introduce the AI as a hiring assistant.
- Tell the candidate the purpose of the screening.
- Ask one question at a time.
- Use follow-up questions when the answer is vague or incomplete.
- Stay within the defined role and interview criteria.
- Avoid collecting unnecessary sensitive personal information.
- End cleanly and explain that HR will review the result.

## 12. Evaluation Design

Do not rely on a single free-form AI paragraph. Produce structured JSON that maps directly to the dashboard.

Example:

```json
{
  "overall_score": 82,
  "technical_score": 84,
  "communication_score": 78,
  "problem_solving_score": 81,
  "experience_score": 85,
  "strengths": [
    "Strong Python fundamentals",
    "Good REST API understanding"
  ],
  "concerns": [
    "Limited PostgreSQL depth"
  ],
  "recommendation": "SHORTLIST",
  "reasoning_summary": "Strong fit for the initial screening round."
}
```

The exact evaluation rubric can be tuned after the first end-to-end interview test.

## 13. Security & Reliability

Mandatory:
- Hunar API key only on the backend.
- Environment variable based configuration.
- `.env*` files excluded from Git.
- No secrets in client bundles, logs, README, screenshots, or sample code.
- Validate all backend inputs.
- Restrict CORS to the deployed frontend origin in production.
- Avoid logging raw credentials or authorization headers.
- Handle provider failures without leaking internal errors to users.

Reliability:
- Explicit interview states: CREATED, ACTIVE, COMPLETED, FAILED.
- Idempotent completion/evaluation where practical.
- Store provider session identifiers separately from internal IDs.
- Preserve the transcript before generating evaluation when provider data supports it.

## 14. UI/UX Principles

- Clean recruiter-facing dashboard.
- Desktop-first but responsive.
- Use shadcn/ui components consistently.
- Make interview status and candidate outcome immediately visible.
- Use badges, tables, cards, dialogs, tabs, progress indicators, and empty states appropriately.
- Avoid excessive visual decoration; prioritize workflow clarity.

## 15. Deployment Plan

Recommended separation:

```text
Frontend: Next.js deployment
Backend:  FastAPI deployment
Database: Managed database
Secrets:  Deployment environment variables
```

Before submission:
1. Run an end-to-end voice interview with the provided Hunar API key.
2. Confirm transcript retrieval/storage.
3. Confirm evaluation generation.
4. Confirm dashboard rendering.
5. Confirm the public repo contains no secret.
6. Confirm the deployed frontend can reach the backend.
7. Add setup and deployment instructions to README.

## 16. Acceptance Criteria

Assignment 1 is considered complete when:

- A user can create a hiring job.
- A candidate can be attached to the job.
- A voice screening interview can be launched through the Hunar integration.
- The application can receive/store the resulting interview information.
- The candidate receives a structured evaluation.
- HR can view the evaluation and transcript from the dashboard.
- The app is deployed and usable from a public URL.
- The GitHub repository contains the source code and documentation.
- The Hunar API key is not exposed in the repository or browser.
- The project uses TypeScript, React.js, Next.js, shadcn/ui, and a Python backend as requested.

## 17. Scope Control

Build the end-to-end happy path first. Optional enhancements such as WhatsApp/SMS/email outreach, advanced analytics, role templates, authentication, and multi-provider voice support should only be added after the core workflow is stable.

## 18. Open Questions / Inputs Needed Before Implementation

1. Exact Hunar Voice API documentation and endpoint format.
2. Supported voice session flow: browser/WebRTC, WebSocket, phone call, or another method.
3. Transcript/event webhook format, if applicable.
4. Whether the API provides native agent creation/configuration or expects an existing agent ID.
5. Any authentication/consent requirements exposed by the provider.

These provider-specific details will determine the final implementation without changing the product architecture above.
