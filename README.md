# Hospital Management System (HMS)

A modern Hospital Management System built with **FastAPI** + **React** + **PostgreSQL**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + asyncpg (direct PostgreSQL) |
| Frontend | React 19 + Vite + React Router 7 |
| Database | PostgreSQL |
| Auth | JWT (python-jose) + bcrypt |
| Package Manager | UV (Python) + npm (JS) |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (running)
- UV (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

### Setup

```bash
# From project root
bash setup.sh
```

Or manually:

```bash
# Backend
cd backend
uv sync
uv run python -m app.init_db   # Creates tables + admin user
uv run uvicorn app.main:app --reload  # Starts on :8000

# Frontend (in another terminal)
cd frontend
npm install
npm run dev  # Starts on :5173
```

### Default Admin
Configure initial administrator credentials in the `backend/.env` file:
- **`ADMIN_EMAIL`**: The email/username of the administrator account.
- **`ADMIN_PASSWORD`**: The password of the administrator account.
*(Refer to `backend/.env.example` for details)*

## Project Structure

```
HMS/
├── backend/
│   ├── pyproject.toml          # UV dependencies
│   ├── app/
│   │   ├── main.py             # FastAPI entry point
│   │   ├── database.py         # asyncpg connection pool
│   │   ├── models.py           # SQL schema
│   │   ├── schemas.py          # Pydantic models
│   │   ├── auth.py             # JWT + password hashing
│   │   ├── init_db.py          # DB initialization
│   │   └── routes/
│   │       ├── auth.py         # /api/auth/*
│   │       ├── user.py         # /api/appointments, /api/doctors, /api/time-slots
│   │       ├── doctor.py       # /api/doctor/*
│   │       └── admin.py        # /api/admin/*
│   └── static/images/          # Hospital images
├── frontend/
│   ├── package.json
│   ├── vite.config.js          # Proxies /api → backend
│   └── src/
│       ├── App.jsx             # Router
│       ├── api.js              # API client
│       ├── context/AuthContext.jsx
│       ├── components/         # Navbar, ProtectedRoute, TimeSlotPicker
│       ├── pages/              # Home, Login, Register, Dashboard, DoctorDashboard, AdminDashboard
│       └── styles/index.css    # Design system
└── setup.sh                    # One-shot setup script
```

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | - | Register user |
| `/api/auth/login` | POST | - | Login (returns JWT) |
| `/api/auth/me` | GET | ✓ | Current user info |
| `/api/doctors` | GET | - | List doctors |
| `/api/appointments` | GET | ✓ | User's appointments |
| `/api/appointments` | POST | ✓ | Book appointment |
| `/api/appointments/:id` | DELETE | ✓ | Cancel appointment |
| `/api/time-slots` | GET | - | Available slots |
| `/api/doctor/appointments` | GET | Doctor | Doctor's appointments |
| `/api/doctor/appointments/:id/complete` | PATCH | Doctor | Mark done |
| `/api/doctor/appointments/:id` | DELETE | Doctor | Remove |
| `/api/admin/doctors` | GET/POST | Admin | List/add doctors |
| `/api/admin/doctors/:id` | DELETE | Admin | Delete doctor |
