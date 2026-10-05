import sys
from pathlib import Path

# Add project root to sys.path so modular folders (linkedin_analyzer, github_analyzer, ai_agent, roadmap) are accessible
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.routers import chat, github, linkedin, roadmap

app = FastAPI(
    title="SkillGap AI - Modular Career Intelligence API",
    version="2.0.0",
    description="Backend API powering LinkedIn Review, GitHub Review, Personalized Roadmap, and Local AI Career Agent.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular routers under /api
app.include_router(linkedin.router, prefix="/api")
app.include_router(github.router, prefix="/api")
app.include_router(roadmap.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


def _error_message(detail: object) -> str:
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list) and detail:
        first = detail[0]
        if isinstance(first, dict):
            loc = ".".join(str(part) for part in first.get("loc", []) if part != "body")
            msg = first.get("msg", "Invalid request")
            return f"{loc}: {msg}" if loc else msg
    return "Request failed"


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"message": _error_message(exc.detail)})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"message": _error_message(exc.errors())})


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "SkillGap AI Modular API",
        "modules": "linkedin_analyzer, github_analyzer, roadmap, ai_agent",
    }
