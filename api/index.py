import json
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

try:
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
