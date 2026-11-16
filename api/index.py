import json
import os
import sys
from pathlib import Path

# Add repository root and backend to sys.path so all modular imports resolve cleanly
ROOT_DIR = Path(__file__).resolve().parent.parent
for p in [
    ROOT_DIR,
    ROOT_DIR / "backend",
    ROOT_DIR / "github_analyzer",
    ROOT_DIR / "linkedin_analyzer",
    ROOT_DIR / "roadmap",
    ROOT_DIR / "ai_agent",
    ROOT_DIR / "skill_verifier",
]:
    p_str = str(p)
    if p_str not in sys.path and p.exists():
        sys.path.insert(0, p_str)

# Signal serverless environment for storage fallbacks
os.environ.setdefault("VERCEL", "1")

try:
    try:
        from app.main import app
    except ImportError:
        from backend.app.main import app
except Exception as e:
    import traceback
    err_tb = traceback.format_exc()

    async def app(scope, receive, send):
        if scope["type"] == "http":
            body = json.dumps({"error": "Startup failed", "detail": err_tb}).encode("utf-8")
            await send({
                "type": "http.response.start",
                "status": 500,
                "headers": [
                    [b"content-type", b"application/json"],
                    [b"content-length", str(len(body)).encode("utf-8")],
                ],
            })
            await send({
                "type": "http.response.body",
                "body": body,
            })

__all__ = ["app"]
