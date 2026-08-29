from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.routers import chat, github, linkedin, roadmap
from app.services.github_service import analyze_github_user
from app.services.store import save_github_result

app = FastAPI(title="SkillGap AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(linkedin.router, prefix="/api")
app.include_router(github.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(roadmap.router, prefix="/api")


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
    return {"status": "ok", "service": "SkillGap AI API"}


class AnalysisRequest(BaseModel):
    username: str = Field(min_length=1)


@app.post("/api/analysis")
async def analyze(body: AnalysisRequest):
    """Unified analysis endpoint — delegates to the existing GitHub analyzer."""
    try:
        result = await analyze_github_user(body.username)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {exc}") from exc

    save_github_result(result)
    return result
