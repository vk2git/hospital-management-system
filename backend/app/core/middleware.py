"""
Rate-limiting middleware for DDoS prevention.

Uses an in-memory sliding window counter per IP + endpoint.
- Account creation: 5 requests / minute
- Login: 10 requests / minute
- Chatbot: 15 requests / minute
- General API: 60 requests / minute
"""

import time
from collections import defaultdict
from dataclasses import dataclass, field

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


@dataclass
class SlidingWindow:
    """Sliding window rate limiter for a single key."""
    timestamps: list = field(default_factory=list)

    def is_allowed(self, max_requests: int, window_seconds: int) -> bool:
        now = time.time()
        cutoff = now - window_seconds
        # Remove expired timestamps
        self.timestamps = [t for t in self.timestamps if t > cutoff]
        if len(self.timestamps) >= max_requests:
            return False
        self.timestamps.append(now)
        return True


# Route-specific limits:  (max_requests, window_seconds)
RATE_LIMITS: dict[str, tuple[int, int]] = {
    "/api/auth/register":    (5, 60),
    "/api/auth/login":       (10, 60),
    "/api/chatbot/message":  (15, 60),
}
DEFAULT_RATE_LIMIT = (60, 60)  # 60 req / min general


class RateLimitMiddleware(BaseHTTPMiddleware):
    """IP-based sliding-window rate limiter."""

    def __init__(self, app):
        super().__init__(app)
        # key = "ip:path" -> SlidingWindow
        self._windows: dict[str, SlidingWindow] = defaultdict(SlidingWindow)

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Only rate-limit API paths
        if not path.startswith("/api/"):
            return await call_next(request)

        ip = self._get_client_ip(request)

        # Pick the most specific limit
        max_req, window = DEFAULT_RATE_LIMIT
        for prefix, limit in RATE_LIMITS.items():
            if path.startswith(prefix):
                max_req, window = limit
                break

        key = f"{ip}:{path}"
        window_obj = self._windows[key]

        if not window_obj.is_allowed(max_req, window):
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please try again later.",
                },
            )

        response = await call_next(request)
        return response


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Reject abnormally large request bodies (anti-DDoS)."""

    MAX_BODY_SIZE = 5 * 1024 * 1024  # 5 MB

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.MAX_BODY_SIZE:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request body too large"},
            )
        return await call_next(request)
