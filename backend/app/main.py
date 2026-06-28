"""
HMS Backend Entry Point.
Initialises FastAPI, connects to PostgreSQL, adds middleware and routers.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.database import get_pool, close_pool
from .core.init_db import init_db
from .core.middleware import RateLimitMiddleware, RequestSizeLimitMiddleware
from .domains.auth.router import router as auth_router
from .domains.patient.router import router as patient_router
from .domains.doctor.router import router as doctor_router
from .domains.admin.router import router as admin_router
from .domains.staff.router import router as staff_router
from .domains.pharmacy.router import router as pharmacy_router
from .domains.notifications import router as notifications_router
from .domains.chatbot import router as chatbot_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up HMS backend...")
    await get_pool()
    await init_db()
    yield
    # Shutdown
    print("Shutting down HMS backend...")
    await close_pool()


app = FastAPI(
    title="Rising Hospital HMS API",
    description="Backend for the Hospital Management System v2",
    version="2.0.0",
    lifespan=lifespan,
)


# ── Middleware ─────────────────────────────────────────────────────────────

# 1. CORS — Ensure credentials (cookies) are allowed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,  # REQUIRED for httpOnly cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Anti-DDoS — Request size limits
app.add_middleware(RequestSizeLimitMiddleware)

# 3. Rate Limiting
app.add_middleware(RateLimitMiddleware)


# ── Exception Handlers ───────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the exception here if we had a logger
    print(f"Global Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )


# ── Routers ──────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(doctor_router)
app.include_router(admin_router)
app.include_router(staff_router)
app.include_router(pharmacy_router)
app.include_router(notifications_router)
app.include_router(chatbot_router)


# ── Health Check ─────────────────────────────────────────────────────────

@app.get("/api/health", tags=["system"])
async def health_check():
    """Basic health check endpoint."""
    return {"status": "ok", "version": "2.0.0"}
