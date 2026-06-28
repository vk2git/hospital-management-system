import os
from pathlib import Path

# Find and load .env file
# Check directory of this file, backend root, and current working directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend/
env_paths = [
    BASE_DIR / ".env",
    Path(".env").resolve(),
    Path("../.env").resolve(),
]

for path in env_paths:
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k:
                        # setdefault prevents overwriting environment variables already set externally
                        os.environ.setdefault(k, v)
        break

# Required environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

missing = []
if not DATABASE_URL:
    missing.append("DATABASE_URL")
if not SECRET_KEY:
    missing.append("SECRET_KEY")
if not ADMIN_EMAIL:
    missing.append("ADMIN_EMAIL")
if not ADMIN_PASSWORD:
    missing.append("ADMIN_PASSWORD")

if missing:
    raise RuntimeError(
        f"Missing required environment variable(s) in .env: {', '.join(missing)}\n"
        f"Please copy .env.example to .env and configure these values."
    )
