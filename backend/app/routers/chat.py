import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ai_agent.backend.schemas import ChatHistoryResponse, ChatMessageRequest, ChatMessageResponse
from ai_agent.backend.service import generate_agent_reply, set_analysis_resolver
from app.services.store import append_chat, get_chat_history, get_github_result, get_linkedin_result

# Provide resolver for looking up saved analyses
set_analysis_resolver(lambda li_id, gh_id: (
    get_linkedin_result(li_id) if li_id else None,
    get_github_result(gh_id) if gh_id else None
))

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(body: ChatMessageRequest) -> ChatMessageResponse:
    reply, conversation_id = await generate_agent_reply(
        message=body.message,
        conversation_id=body.conversationId,
        linkedin_analysis_id=body.linkedinAnalysisId,
        github_analysis_id=body.githubAnalysisId,
    )
    # Sync with store
    append_chat(conversation_id, "user", body.message)
    append_chat(conversation_id, "bot", reply)
    return ChatMessageResponse(reply=reply, conversationId=conversation_id)


@router.get("/history/{conversation_id}", response_model=ChatHistoryResponse)
async def get_history(conversation_id: str) -> ChatHistoryResponse:
    messages = get_chat_history(conversation_id)
    if not messages:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ChatHistoryResponse(conversationId=conversation_id, messages=messages)
