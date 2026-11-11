# SILVERFOXNS JARVIS — Backend

FastAPI backend: authentication, the secure command dispatcher, audit logging,
encrypted conversation memory, and the OpenAI integration (server-side key +
short-lived **ephemeral Realtime tokens** so the key never reaches the phone).

## Why the backend exists (security model)

- The **real OpenAI key lives only here.** The phone asks the backend for a
  short-lived ephemeral Realtime token and connects to OpenAI directly with it.
- **Every command is authorized here**, through one pipeline: intent → permission
  check → risk assessment → confirmation (for high-risk) → directive → result
  verification → spoken response. The backend never performs a device action and
  never runs AI-generated code — it returns an authorized *directive* that the
  native app executes with the user's OS permissions.
- **Everything is audited** (`audit_logs`), and conversation memory is encrypted
  at rest and only stored with the user's explicit consent.

## Run locally

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then edit it

# Option A — zero dependencies (SQLite), good for first run:
#   leave DATABASE_URL blank in .env
uvicorn app.main:app --reload

# Option B — PostgreSQL (recommended):
docker compose up -d db
#   set DATABASE_URL=postgresql+psycopg2://jarvis:jarvis@localhost:5432/jarvis
alembic upgrade head
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs for the interactive API, and
http://localhost:8000/health for a status check.

## Required secrets (generate your own)

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"            # JWT_SECRET
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"  # FERNET_KEY
```

Set `OPENAI_API_KEY` for live voice/chat. Without it, `/ai/*` returns `503`
(by design — no fake responses).

## Key endpoints (`/api/v1`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/register`, `/auth/login`, `/auth/refresh` | accounts + short-lived tokens |
| GET  | `/auth/me` · PATCH `/auth/consent` | profile, memory/biometric consent |
| GET  | `/commands/catalog` | every command with risk + required permissions |
| POST | `/commands/execute` | run the dispatcher (returns `authorized` / `needs_confirmation` / `denied`) |
| POST | `/commands/result` | device reports outcome; returns spoken response |
| POST | `/ai/realtime/session` | mint an ephemeral OpenAI Realtime token for the device |
| POST | `/ai/chat` | text chat fallback |
| WS   | `/api/v1/voice/stream?token=...` | authorize tool calls during a live voice session |

## Tests

```bash
# from the repo root, with the venv active
python tests/test_smoke.py
```

Covers the auth flow, catalog, a low-risk authorize, the high-risk
confirmation round-trip, permission denial, and the OpenAI-not-configured 503.
