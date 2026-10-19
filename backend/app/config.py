import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"
BACKEND_ENV = Path(__file__).resolve().parents[1] / ".env"

if ROOT_ENV.exists():
    load_dotenv(ROOT_ENV)
if BACKEND_ENV.exists():
    load_dotenv(BACKEND_ENV)


def _clean_supabase_url(url: str | None) -> str | None:
    if not url:
        return None
    cleaned = url.split("/rest/v1")[0].rstrip("/")
    return cleaned or None


@dataclass(frozen=True)
class Settings:
    cors_origins: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://192.168.26.211:5173,*",
    )
    github_token: str | None = os.getenv("GITHUB_TOKEN") or None
    groq_api_key: str | None = os.getenv("GROQ_API_KEY") or None
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY") or None
    supabase_url: str | None = _clean_supabase_url(os.getenv("SUPABASE_URL"))
    supabase_anon_key: str | None = os.getenv("SUPABASE_ANON_KEY") or None
    supabase_service_role_key: str | None = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or None

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)


settings = Settings()
