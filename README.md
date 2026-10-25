# TaskFlow Cloud — Cloud-Based Student Task and Study Management System

Full-stack app: **React (Vite) + Flask + SQLite/PostgreSQL + local disk storage**.
All features are wired end-to-end — no mock data remains in the app.

## What it does

- Secure register/login (bcrypt + JWT), per-user data isolation.
- Tasks: create/edit/delete, status flow, search, filter (status/priority/
  subject), sort, overdue highlighting, delete confirmation.
- Dashboard: totals, completion %, upcoming deadlines, recent tasks, status
  charts — all from `GET /api/dashboard/stats`.
- Study notes: upload/download/delete PDF/TXT/DOCX (5 MB), validated client
  and server side; bytes are stored on the application host's local disk.

## Project layout

```text
frontend/src/  components/ pages/ layouts/ services/ (api, auth, task,
               dashboard, file) context/ hooks/ utils/ App.jsx main.jsx
backend/app/   routes/ (auth, tasks, dashboard, files) models/ (User, Task,
               StudyFile) services/ (validation) storage/ (local)
backend/       config.py run.py seed_demo.py requirements.txt
               deploy/ (systemd, nginx) .env.example .env.production.example
docs/          architecture.md api.md deployment.md submission.md
```

## Prerequisites

Node 24 + npm 11, Python 3.10, Git, Windows PowerShell 5.1.

## Run locally (two terminals)

```powershell
# Terminal 1 — backend :5000
cd "E:\TaskFlow Cloud\backend"
.\venv\Scripts\Activate.ps1          # NOT (base): prompt must show (venv)
pip install -r requirements.txt
Copy-Item .env.example .env          # first time only
flask --app run db upgrade           # create tables (SQLite)
python seed_demo.py                  # optional demo data (demo@college.edu / password123)
python run.py                        # http://127.0.0.1:5000/api/health -> db: up

# Terminal 2 — frontend :5173
cd "E:\TaskFlow Cloud\frontend"
npm install
Copy-Item .env.example .env
npm run dev                          # open the printed URL, register or log in
```

`frontend/.env`: `VITE_API_BASE_URL=http://127.0.0.1:5000/api`.

## Tests and builds (actually executed)

```powershell
cd "E:\TaskFlow Cloud\backend"; .\venv\Scripts\Activate.ps1; pytest -q
# 11 passed (auth, tasks, ownership, dashboard, files, error shapes)
cd "E:\TaskFlow Cloud\frontend"; npm run build   # ✓ built
```

Manual end-to-end: register → create 2 tasks → dashboard counts change →
upload a PDF → download it → delete task (files kept) → profile rename →
logout → `/` redirects to login.

## AWS (configured, documented — not deployed from here)

`docs/deployment.md` + `backend/deploy/` + `amplify.yml` cover RDS
PostgreSQL, EC2 (Gunicorn/systemd/Nginx), and Amplify
hosting, plus cost cleanup. Live deployment needs your AWS account; nothing
here creates paid resources on its own.

## Docs for evaluators

- `docs/submission.md` — abstract, problem, objectives, requirements, schema,
  tests, limitations, future work, conclusion.
- `docs/architecture.md` — data flow, service rationale, security.
- `docs/api.md` — every endpoint with example requests.
