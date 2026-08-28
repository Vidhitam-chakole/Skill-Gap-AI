import json
from pathlib import Path

from app.schemas import GitHubResult, LinkedInResult, RoadmapResult

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
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
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


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


def save_linkedin_result(result: LinkedInResult) -> None:
    linkedin_results[result.analysisId] = result
    _dump_map(_LI_PATH, {key: value.model_dump() for key, value in linkedin_results.items()})


def get_linkedin_result(analysis_id: str) -> LinkedInResult | None:
    return linkedin_results.get(analysis_id)


def save_github_result(result: GitHubResult) -> None:
    github_results[result.analysisId] = result
    _dump_map(_GH_PATH, {key: value.model_dump() for key, value in github_results.items()})


def get_github_result(analysis_id: str) -> GitHubResult | None:
    return github_results.get(analysis_id)


def save_roadmap_result(result: RoadmapResult) -> None:
    roadmap_results[result.roadmapId] = result
    _dump_map(_RM_PATH, {key: value.model_dump() for key, value in roadmap_results.items()})


def get_roadmap_result(roadmap_id: str) -> RoadmapResult | None:
    return roadmap_results.get(roadmap_id)


def get_chat_history(conversation_id: str) -> list[dict[str, str]]:
    return chat_conversations.get(conversation_id, [])


def append_chat(conversation_id: str, role: str, text: str) -> None:
    chat_conversations.setdefault(conversation_id, []).append({"role": role, "text": text})
    _dump_map(_CHAT_PATH, chat_conversations)
