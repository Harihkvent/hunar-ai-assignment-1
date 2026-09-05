# Hunar.AI — AI Hiring Assistant & Voice Screening Platform

An AI-powered voice screening and recruitment web application for HR and talent acquisition teams to configure hiring positions, initiate automated phone screening calls using **Hunar.AI Voice AI Agents**, capture conversation audio & transcripts, generate structured multi-dimensional candidate evaluations, and review decisions in an executive dashboard.

---

## 🚀 Key Features

### 1. 📊 Executive Recruiter Dashboard
- **Real-Time Pipeline KPIs**: Active job positions, total candidates screened, completed voice interviews, shortlist conversion rates, and organization-wide average scores.
- **Recent Voice Screenings Feed**: Live call status tracking (`INITIATED`, `RINGING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`), duration meters, and one-click scorecard navigation.
- **Active Job Pipeline Snapshot**: Instant candidate counts and stage distributions per job role.

### 2. 💼 Dynamic Job Position & Voice Agent Builder
- **Role Configuration**: Job title, department, location/work model, experience range, core required skills, and preferred skill tags.
- **Automated Hunar Voice Agent Sync**: Dynamically generates tailored conversational prompts, screening objectives, and structured result schemas on the **Hunar.AI External API** (`https://api.voice.hunar.ai/external/v1/`).
- **Voice Persona Selection**: Choose from 6 professional voice models (`NEHA`, `ROY`, `ZOE`, `SAM`, `MIRA`, `EESHA`), custom persona display names (e.g. `Aria`), and 10+ supported languages (English, Hindi, Tamil, Telugu, Kannada, Marathi, Malayalam, Gujarati, Bengali, Spanish).

### 3. 👥 Candidate Management Pipeline
- **Candidate Directory**: Search and filter applicants by applied job, experience, status, or keyword.
- **Job Attachment**: Attach candidates to jobs with contact details in E.164 phone format and resume notes.
- **One-Click Voice Screening**: Trigger outbound phone calls or interactive web simulator sessions with a single click.

### 4. 📞 Real-Time AI Voice Screening Console
- **Live Outbound Phone Calls**: Dispatches actual telephony calls to candidate numbers via Hunar Voice API with customizable organization caller IDs.
- **Interactive Web Simulator Mode**: Full in-browser voice screening session featuring speech synthesis, real-time question stepper, and automated transcript generation for testing.
- **Live Telephony Monitor**: Status indicators, call elapsed timer, candidate speech duration metrics, and telephony provider event logs.

### 5. 🎯 Structured Candidate Evaluation Scorecards
- **Multi-Dimensional Scoring**: Evaluates candidates across **Technical Competence**, **Communication & Clarity**, **Problem Solving**, and **Experience Match** (0–100 scale).
- **AI Recommendation Engine**: Categorizes candidates into `STRONG_HIRE`, `SHORTLIST`, `NEEDS_REVIEW`, or `REJECT`.
- **Itemized Question Breakdown**: Stores each screening question, candidate response, individual score (1–10), and contextual evaluation feedback.
- **Key Strengths & Risk Area Badges**: Automatically highlights candidate technical strengths and flags experience gaps.
- **Integrated Audio Player**: Audio recording playback with waveform visualizer, seek bar, time tracking, and playback speed multiplier (1x, 1.25x, 1.5x, 2x).
- **Recruiter Decision Workflow**: Recruiter decision buttons (`Shortlist for Round 2`, `Flag for Review`, `Reject`) with reviewer notes and interactive celebration effects.

### 6. 🛡️ Security, Webhooks & System Diagnostics
- **Strict Credential Isolation**: The Hunar API key is stored exclusively on the Python backend trust boundary and is never exposed to the client browser.
- **Signed Webhook Receiver**: Endpoint at `/api/webhooks/hunar` verifies `X-Hunar-Signature` and `X-Hunar-Timestamp` using HMAC-SHA256 digests.
- **Integration Health Monitor**: Live check of Hunar API authentication, agent provisioning counts, and organization caller ID phone numbers with allowed country destinations.

---

## 🛠️ Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                   Recruiter UI                         │
│   Next.js 14+ (App Router, TypeScript, Tailwind CSS)   │
│   - Overview Dashboard & Analytics                     │
│   - Job Builder & Agent Synchronizer                   │
│   - Candidate Pipeline Directory                       │
│   - Real-Time Screening Console & Audio Player         │
│   - Structured Evaluation Scorecards                   │
└───────────────────────────┬────────────────────────────┘
                            │ REST API / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│              FastAPI Backend (Python 3.12)             │
│   - /api/jobs (CRUD & Hunar Agent Auto-Provision)      │
│   - /api/candidates (Pipeline & Attachments)           │
│   - /api/interviews (Trigger Calls, Poll, Simulate)    │
│   - /api/evaluations (Scorecards & Recruiter Decision) │
│   - /api/webhooks/hunar (HMAC-SHA256 Signed Receiver)  │
│   - /api/system/health (Telephony & Connection Health) │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌──────────────────────────┐    ┌─────────────────────────┐
│     SQLite Database      │    │  Hunar.AI Voice API     │
│   Jobs, Candidates,      │    │  - External v1 API      │
│   Interviews, Scorecards │    │  - Outbound Phone Calls │
│   Evaluations, Webhooks  │    │  - Voice Call Recording │
└──────────────────────────┘    └─────────────────────────┘
```

- **Backend**: Python 3.12, FastAPI, SQLAlchemy, Pydantic v2, HTTPX, Uvicorn
- **Frontend**: Next.js 14+, React.js, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Voice AI Provider**: Hunar.AI External Voice Agent API (`https://api.voice.hunar.ai/external/v1/`)

---

## ⚙️ Local Development Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ (tested on Node.js v24)
- npm or yarn

---

### Step 1: Clone the Repository & Configure Environment

```bash
git clone https://github.com/Harihkvent/hunar-ai-assignment-1.git
cd hunar-ai-assignment-1
```

Create `.env` in the root directory (refer to `.env.example`):
```env
# Hunar.AI Voice API Configuration
HUNAR_API_KEY=your_hunar_api_key_here
HUNAR_BASE_URL=https://api.voice.hunar.ai/external/v1

# Backend Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Database
DATABASE_URL=sqlite:///./hiring_assistant.db

# Webhook Callback Configuration
WEBHOOK_BASE_URL=http://localhost:8000
```

---

### Step 2: Start the FastAPI Backend

#### Windows (PowerShell):
```powershell
# Create & activate virtual environment
python -m venv backend/.venv
.\backend\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt

# Run database tests & automated test suite
python backend/test_e2e.py

# Start the FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### macOS / Linux:
```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
python backend/test_e2e.py
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will start at: `http://localhost:8000`
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/system/health`

---

### Step 3: Start the Next.js Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

The web application will be accessible at: `http://localhost:3000`

---

## 🧪 Automated Testing

To run the complete automated test suite verifying health check, job creation, candidate attachment, voice screening session, scorecard evaluation, and HMAC webhook signature validation:

```bash
python backend/test_e2e.py
```

Expected output:
```text
========================================
Running End-to-End System Tests
========================================
[1/7] Testing /api/system/health... [OK]
[2/7] Testing /api/dashboard/stats... [OK]
[3/7] Testing Job Creation & Hunar Agent Auto-Sync... [OK]
[4/7] Testing Candidate Attachment... [OK]
[5/7] Testing Voice Screening Session Execution... [OK]
[6/7] Testing Structured Evaluation Scorecard & Decision... [OK]
[7/7] Testing Webhook Signature Verification... [OK]
========================================
ALL TESTS PASSED SUCCESSFULLY (7/7) [OK]
========================================
```

---

## 🚢 Deployment Guide

### Option A: Frontend on Vercel
1. Import the repository on [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api`
4. Deploy!

### Option B: Backend on Render / Railway / Fly.io / AWS
1. Root directory: `./`
2. Build Command: `pip install -r backend/requirements.txt`
3. Start Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `HUNAR_API_KEY=your_hunar_api_key_here`
   - `HUNAR_BASE_URL=https://api.voice.hunar.ai/external/v1`
   - `DATABASE_URL=sqlite:///./hiring_assistant.db` (or PostgreSQL connection string)
   - `CORS_ORIGINS=https://your-frontend-domain.vercel.app`
   - `WEBHOOK_BASE_URL=https://your-backend-domain.com`

---

## 🔒 Security Summary

1. **No API Key on Client**: The frontend communicates only with the local FastAPI endpoints. All external Hunar calls are authenticated server-side.
2. **Repository Cleanliness**: `.env` and SQLite files are strictly listed in `.gitignore`.
3. **Webhook Verification**: Validates `X-Hunar-Signature` with HMAC-SHA256 digests and enforces 300-second timestamp freshness to prevent replay attacks.
4. **CORS Control**: Access restricted to configured frontend origins.

---

## 📄 License
MIT License. Built for Hunar.AI Assignment 1.