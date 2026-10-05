import sys
from pathlib import Path

# Add project root and backend dir to sys.path so modular folders and app package are accessible
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.routers import chat, github, linkedin, roadmap, skill_verifier

app = FastAPI(
    title="SkillGap AI - Modular Career Intelligence API",
    version="2.0.0",
    description="Backend API powering LinkedIn Review, GitHub Review, Personalized Roadmap, Local AI Career Agent, and Skill Verifier.",
)

cors_origins = settings.cors_origin_list
if "*" in cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins if cors_origins else ["*"],
        allow_credentials=bool(cors_origins),
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount modular routers under /api
app.include_router(linkedin.router, prefix="/api")
app.include_router(github.router, prefix="/api")
app.include_router(roadmap.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(skill_verifier.router, prefix="/api")


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


from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

DIST_DIR = ROOT_DIR / "frontend" / "dist"

@app.get("/api")
@app.get("/api/")
@app.get("/api/health")
@app.get("/health")
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "SkillGap AI Modular API",
        "modules": "linkedin_analyzer, github_analyzer, roadmap, ai_agent, skill_verifier",
    }


if DIST_DIR.exists():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise StarletteHTTPException(status_code=404, detail="Not Found")
        target_file = DIST_DIR / full_path
        if target_file.is_file():
            return FileResponse(str(target_file))
        index_file = DIST_DIR / "index.html"
        if index_file.is_file():
            return FileResponse(str(index_file))
        raise StarletteHTTPException(status_code=404, detail="Not Found")
else:
    @app.get("/")
    async def root_fallback():
        return {
            "status": "ok",
            "service": "SkillGap AI Modular API",
            "message": "Frontend build not detected. Visit /api/health for API status.",
        }

