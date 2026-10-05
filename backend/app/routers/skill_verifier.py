import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from skill_verifier.backend.router import router
from skill_verifier.backend.service import set_github_resolver
from app.services.store import get_github_result

# Connect github resolver to retrieve saved GitHub analyses
set_github_resolver(get_github_result)

__all__ = ["router"]
