# Complete Vercel Deployment Guide (Separate Frontend & Backend)

This guide walks you through deploying the **Hunar AI Hiring Assistant** monorepo as **two separate, secure instances** on Vercel:
1. **Backend Instance** (FastAPI Serverless)
2. **Frontend Instance** (Next.js App)

---

## 🔒 Security & Secrets Isolation Overview

```
+---------------------------------------------------------------------------------+
|                                 MONOREPO (Git)                                  |
|                                                                                 |
|   frontend/                                    backend/                         |
|   ├── .env.example (Public only)               ├── .env.example (Private secrets)|
|   └── ...                                      └── ...                          |
+-----------------------+----------------------------------+----------------------+
                        |                                  |
                        v                                  v
+------------------------------------+   +------------------------------------+
|       VERCEL PROJECT 1             |   |          VERCEL PROJECT 2          |
|       (Next.js Frontend)           |   |          (FastAPI Backend)         |
|                                    |   |                                    |
|   Root Directory: `frontend`       |   |   Root Directory: `backend`        |
|                                    |   |                                    |
|   Environment Variable:            |   |   Environment Variables (Secrets): |
|   - NEXT_PUBLIC_API_URL            |   |   - HUNAR_API_KEY                  |
|                                    |   |   - DATABASE_URL (Cloud Postgres)  |
|   ✅ NO API keys in frontend       |   |   - CORS_ORIGINS                   |
|   ✅ Client-side code is safe      |   |   - HUNAR_BASE_URL                 |
+-----------------+------------------+   +-----------------+------------------+
                  |                                        |
                  |          Encrypted API Calls           |
                  +----------------------------------------+
                               (CORS Protected)
```

---

## Step 1: Set Up Cloud Database (PostgreSQL)

> [!IMPORTANT]
> Because Vercel serverless functions are ephemeral, SQLite files in the filesystem do not persist across function cold starts. A free cloud PostgreSQL database is recommended for production persistence.

1. Create a free PostgreSQL database on **[Neon.tech](https://neon.tech)**, **[Supabase](https://supabase.com)**, or **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)**.
2. Copy your connection string. It looks like:
   ```
   postgresql://username:password@ep-host.region.neon.tech/neondb?sslmode=require
   ```
   *(The backend automatically connects and initializes all tables and seed data on startup).*

---

## Step 2: Deploy Backend to Vercel (Project 1)

1. Open your **[Vercel Dashboard](https://vercel.com/new)** and click **"Add New..." -> "Project"**.
2. Select your Git repository: `hunar-ai-assignment-1`.
3. In the project configuration screen:
   - **Project Name**: e.g., `hunar-ai-backend`
   - **Framework Preset**: `Other` (or leave default)
   - **Root Directory**: Click **Edit** and select **`backend`**
4. Expand **Environment Variables** and add the following backend secrets:

| Key | Value Example | Description |
| :--- | :--- | :--- |
| `HUNAR_API_KEY` | `sk_live_...` | Your Hunar.AI voice API key |
| `HUNAR_BASE_URL` | `https://api.voice.hunar.ai/external/v1` | Hunar.AI API base URL |
| `DATABASE_URL` | `postgresql://...` | Your Cloud PostgreSQL connection string |
| `CORS_ORIGINS` | `*` *(temporary until frontend URL is generated)* | Allowed frontend origins |
| `WEBHOOK_BASE_URL` | *(leave blank or set to backend URL later)* | Optional webhook base URL |

5. Click **"Deploy"**.
6. Once deployed, copy your backend production URL (e.g. `https://hunar-ai-backend.vercel.app`).
   - Test it by visiting: `https://hunar-ai-backend.vercel.app/docs` (Swagger UI) or `https://hunar-ai-backend.vercel.app/api/system/health`.

---

## Step 3: Deploy Frontend to Vercel (Project 2)

1. Return to the **[Vercel Dashboard](https://vercel.com/new)** and click **"Add New..." -> "Project"**.
2. Select the **same Git repository**: `hunar-ai-assignment-1`.
3. In the project configuration screen:
   - **Project Name**: e.g., `hunar-ai-frontend`
   - **Framework Preset**: `Next.js` (automatically detected)
   - **Root Directory**: Click **Edit** and select **`frontend`**
4. Expand **Environment Variables** and add:

| Key | Value Example | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://hunar-ai-backend.vercel.app/api` | **Must include `/api` suffix** pointing to your backend URL from Step 2 |

5. Click **"Deploy"**.
6. Once deployed, copy your frontend production URL (e.g. `https://hunar-ai-frontend.vercel.app`).

---

## Step 4: Lock Down Backend CORS Origins

1. Go to your **Backend Project** in Vercel (`hunar-ai-backend`) -> **Settings** -> **Environment Variables**.
2. Edit `CORS_ORIGINS` to lock down access specifically to your frontend domain:
   ```
   https://hunar-ai-frontend.vercel.app,http://localhost:3000
   ```
3. Go to **Deployments** -> click the three dots on your latest deployment -> **Redeploy** to apply the updated environment variable.

---

## Step 5: Verification & Safety Checklist

- [x] **No Secrets in Frontend**: Open browser DevTools -> Network / Sources on the frontend. Search for `HUNAR_API_KEY` or `DATABASE_URL`. Confirm they are **nowhere** in frontend client JS bundles.
- [x] **System Health Check**: Visit your frontend `/` dashboard. The Hunar API status indicator and system stats should show healthy and online.
- [x] **Database Persistence**: Create a new Job or Candidate in the frontend UI, refresh the page, and verify the data persists cleanly via your cloud database.
- [x] **Voice Simulation & Calls**: Launch an AI Voice Screening session via Simulator or Phone call to test live integration.

---

## Local Development Setup

To run both instances locally:

### 1. Backend (`/backend`)
```bash
cd backend
cp .env.example .env
# Edit .env and fill in HUNAR_API_KEY
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python run.py
```
Backend runs on `http://localhost:8000`.

### 2. Frontend (`/frontend`)
```bash
cd frontend
cp .env.example .env.local
# .env.local defaults to NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.
