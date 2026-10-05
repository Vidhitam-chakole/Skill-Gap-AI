import os
import sys
from pathlib import Path

# Add repository root and backend to sys.path so all modular imports resolve cleanly
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Signal serverless environment for storage fallbacks
os.environ.setdefault("VERCEL", "1")

from backend.app.main import app

# Vercel Python runtime detects ASGI `app`
__all__ = ["app"]
