import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException

ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.schemas import UserProfileCreateRequest, UserProfileResponse
from app.services.store import get_profile, save_profile

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/profile", response_model=UserProfileResponse)
async def create_profile(body: UserProfileCreateRequest) -> UserProfileResponse:
    profile_id = uuid.uuid4().hex
    now = datetime.now(timezone.utc).isoformat()
    payload = {
        "userId": profile_id,
        "name": body.name.strip(),
        "githubUsername": body.githubUsername.strip() if body.githubUsername else None,
        "linkedinUrl": body.linkedinUrl.strip() if body.linkedinUrl else None,
        "email": body.email.strip() if body.email else None,
        "createdAt": now,
    }
    save_profile(profile_id, payload)
    return UserProfileResponse(**payload)


@router.get("/profile/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(user_id: str) -> UserProfileResponse:
    profile = get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    return UserProfileResponse(**profile)
