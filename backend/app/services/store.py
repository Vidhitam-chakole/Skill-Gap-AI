import json
import logging
import os
from pathlib import Path
from typing import Any

from app.config import settings
from app.schemas import GitHubResult, LinkedInResult, RoadmapResult

logger = logging.getLogger(__name__)

try:
    from supabase import create_client
except Exception:  # pragma: no cover - optional dependency for local fallback
    create_client = None

if os.environ.get("VERCEL"):
    DATA_DIR = Path("/tmp") / "skillgap_data"
else:
    DATA_DIR = Path(__file__).resolve().parents[2] / "data"

try:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
except OSError:
    DATA_DIR = Path("/tmp") / "skillgap_data"
    DATA_DIR.mkdir(parents=True, exist_ok=True)

_LI_PATH = DATA_DIR / "linkedin.json"
_GH_PATH = DATA_DIR / "github.json"
_RM_PATH = DATA_DIR / "roadmap.json"
_CHAT_PATH = DATA_DIR / "chat.json"


def _load_map(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def _dump_map(path: Path, payload: dict) -> None:
    try:
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    except OSError:
        pass


def _load_models(path: Path, model):
    raw = _load_map(path)
    result = {}
    for key, value in raw.items():
        try:
            result[key] = model.model_validate(value)
        except Exception:
            continue
    return result


linkedin_results: dict[str, LinkedInResult] = _load_models(_LI_PATH, LinkedInResult)
github_results: dict[str, GitHubResult] = _load_models(_GH_PATH, GitHubResult)
roadmap_results: dict[str, RoadmapResult] = _load_models(_RM_PATH, RoadmapResult)
chat_conversations: dict[str, list[dict[str, str]]] = _load_map(_CHAT_PATH)


def _supabase_client():
    if not settings.supabase_enabled or create_client is None:
        return None
    try:
        return create_client(settings.supabase_url, settings.supabase_service_role_key)
    except Exception as exc:
        logger.debug(f"Could not initialize Supabase client: {exc}")
        return None


def _format_table_row(table_name: str, record_id: str, payload: Any) -> dict:
    """Format structured database columns per respected table, including full payload jsonb."""
    if not isinstance(payload, dict):
        return {
            "id": record_id,
            "payload": payload,
        }
    if table_name == "linkedin_results":
        return {
            "id": record_id,
            "profile_url": payload.get("profileUrl", ""),
            "name": payload.get("name", ""),
            "headline": payload.get("headline", ""),
            "overall_score": payload.get("overallScore", 0),
            "skill_gaps": payload.get("skillGaps", []),
            "strengths": payload.get("strengths", []),
            "market_demand": payload.get("marketDemand", []),
            "payload": payload,
        }
    elif table_name == "github_results":
        return {
            "id": record_id,
            "username": payload.get("username", ""),
            "name": payload.get("name", ""),
            "overall_score": payload.get("overallScore", 0),
            "stats": payload.get("stats", {}),
            "top_languages": payload.get("topLanguages", []),
            "skill_gaps": payload.get("skillGaps", []),
            "pinned_repos": payload.get("pinnedRepos", []),
            "payload": payload,
        }
    elif table_name == "roadmap_results":
        weeks_data = payload.get("weeks", [])
        return {
            "id": record_id,
            "combined_score": payload.get("combinedScore", 0),
            "summary": payload.get("summary", ""),
            "strong_languages": payload.get("strongLanguages", []),
            "primary_language": payload.get("primaryLanguage", ""),
            "total_milestones": payload.get("totalMilestones", len(weeks_data)),
            "estimated_total_duration": payload.get("estimatedTotalDuration", ""),
            "priorities": payload.get("priorities", []),
            "weeks": weeks_data,
            "next_actions": payload.get("nextActions", []),
            "payload": payload,
        }
    elif table_name == "user_profiles":
        return {
            "id": record_id,
            "name": payload.get("name", ""),
            "email": payload.get("email"),
            "github_username": payload.get("githubUsername"),
            "linkedin_url": payload.get("linkedinUrl"),
            "payload": payload,
        }
    elif table_name == "quiz_evaluations":
        return {
            "id": record_id,
            "language": payload.get("language", ""),
            "score": payload.get("score", 0),
            "total_questions": payload.get("totalQuestions", 0),
            "percentage": payload.get("percentage", 0),
            "authenticity_status": payload.get("authenticityStatus", ""),
            "authenticity_label": payload.get("authenticityLabel", ""),
            "badge": payload.get("badge", ""),
            "summary": payload.get("summary", ""),
            "ai_detection_insight": payload.get("aiDetectionInsight", ""),
            "concept_breakdown": payload.get("conceptBreakdown", []),
            "recommendations": payload.get("recommendations", []),
            "detailed_review": payload.get("detailedReview", []),
            "payload": payload,
        }
    return {
        "id": record_id,
        "payload": payload,
    }


def _supabase_save_record(table_name: str, record_id: str, payload: dict) -> bool:
    client = _supabase_client()
    if client is None:
        return False

    success = False

    # 1. Attempt to save directly to dedicated table
    try:
        row = _format_table_row(table_name, record_id, payload)
        client.table(table_name).upsert(row, on_conflict="id").execute()
        success = True
    except Exception as exc:
        logger.debug(f"Direct upsert to table '{table_name}' failed: {exc}")

    # 2. Mirror into app_data fallback table if available
    try:
        client.table("app_data").upsert(
            {
                "id": record_id,
                "table_name": table_name,
                "payload": payload,
            },
            on_conflict="id",
        ).execute()
        success = True
    except Exception as exc:
        logger.debug(f"Upsert to app_data fallback failed: {exc}")

    return success


def _supabase_fetch_record(table_name: str, record_id: str):
    client = _supabase_client()
    if client is None:
        return None

    # 1. Try fetching from dedicated table
    try:
        response = client.table(table_name).select("*").eq("id", record_id).limit(1).execute()
        rows = getattr(response, "data", []) or []
        if rows:
            row = rows[0]
            if isinstance(row.get("payload"), dict) and row["payload"]:
                return row["payload"]
            return row
    except Exception as exc:
        logger.debug(f"Direct fetch from table '{table_name}' failed: {exc}")

    # 2. Fall back to app_data table
    try:
        response = client.table("app_data").select("payload").eq("table_name", table_name).eq("id", record_id).limit(1).execute()
        rows = getattr(response, "data", []) or []
        if rows:
            return rows[0].get("payload")
    except Exception as exc:
        logger.debug(f"Fallback fetch from app_data failed: {exc}")

    return None


def _supabase_chat_history(conversation_id: str) -> list[dict[str, str]]:
    client = _supabase_client()
    if client is None:
        return []
    try:
        response = client.table("chat_messages").select("role, text").eq("conversation_id", conversation_id).order("created_at", desc=False).execute()
        rows = getattr(response, "data", []) or []
        return [{"role": row.get("role", "user"), "text": row.get("text", "")} for row in rows]
    except Exception:
        return []


def _supabase_append_chat(conversation_id: str, role: str, text: str) -> bool:
    client = _supabase_client()
    if client is None:
        return False
    try:
        client.table("chat_messages").insert({
            "conversation_id": conversation_id,
            "role": role,
            "text": text,
        }).execute()
        return True
    except Exception:
        return False


def save_linkedin_result(result: LinkedInResult) -> None:
    linkedin_results[result.analysisId] = result
    _dump_map(_LI_PATH, {key: value.model_dump() for key, value in linkedin_results.items()})
    _supabase_save_record("linkedin_results", result.analysisId, result.model_dump())


def get_linkedin_result(analysis_id: str) -> LinkedInResult | None:
    record = _supabase_fetch_record("linkedin_results", analysis_id)
    if record is not None:
        return LinkedInResult.model_validate(record)
    return linkedin_results.get(analysis_id)


def save_github_result(result: GitHubResult) -> None:
    github_results[result.analysisId] = result
    _dump_map(_GH_PATH, {key: value.model_dump() for key, value in github_results.items()})
    _supabase_save_record("github_results", result.analysisId, result.model_dump())


def get_github_result(analysis_id: str) -> GitHubResult | None:
    record = _supabase_fetch_record("github_results", analysis_id)
    if record is not None:
        return GitHubResult.model_validate(record)
    return github_results.get(analysis_id)


def save_roadmap_result(result: RoadmapResult) -> None:
    roadmap_results[result.roadmapId] = result
    _dump_map(_RM_PATH, {key: value.model_dump() for key, value in roadmap_results.items()})
    _supabase_save_record("roadmap_results", result.roadmapId, result.model_dump())


def get_roadmap_result(roadmap_id: str) -> RoadmapResult | None:
    record = _supabase_fetch_record("roadmap_results", roadmap_id)
    if record is not None:
        return RoadmapResult.model_validate(record)
    return roadmap_results.get(roadmap_id)


def save_profile(user_id: str, payload: dict) -> dict:
    _supabase_save_record("user_profiles", user_id, payload)
    return payload


def get_profile(user_id: str) -> dict | None:
    record = _supabase_fetch_record("user_profiles", user_id)
    if record is not None:
        return record
    return None


def get_chat_history(conversation_id: str) -> list[dict[str, str]]:
    supabase_history = _supabase_chat_history(conversation_id)
    if supabase_history:
        return supabase_history
    return chat_conversations.get(conversation_id, [])


def append_chat(conversation_id: str, role: str, text: str) -> None:
    chat_conversations.setdefault(conversation_id, []).append({"role": role, "text": text})
    _dump_map(_CHAT_PATH, chat_conversations)
    _supabase_append_chat(conversation_id, role, text)
