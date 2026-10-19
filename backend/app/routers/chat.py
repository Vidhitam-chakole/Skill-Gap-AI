import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

ROOT_DIR = Path(__file__).resolve().parents[3]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ai_agent.backend.schemas import (
    ChatConfigResponse,
    ChatHistoryResponse,
    ChatMessageRequest,
    ChatMessageResponse,
)
from ai_agent.backend.service import (
    generate_agent_reply,
    get_groq_model,
    is_groq_configured,
    set_analysis_resolver,
)
from app.services.store import append_chat, get_chat_history, get_github_result, get_linkedin_result

# Provide resolver for looking up saved analyses
set_analysis_resolver(lambda li_id, gh_id: (
    get_linkedin_result(li_id) if li_id else None,
    get_github_result(gh_id) if gh_id else None
))

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/config", response_model=ChatConfigResponse)
async def get_chat_config() -> ChatConfigResponse:
    """Returns whether Groq AI is configured and active model details."""
    return ChatConfigResponse(
        groqConfigured=is_groq_configured(),
        model=get_groq_model(),
        supportedModels=[
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
        ],
    )


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(body: ChatMessageRequest) -> ChatMessageResponse:
    reply, conversation_id, meta = await generate_agent_reply(
        message=body.message,
        conversation_id=body.conversationId,
        linkedin_analysis_id=body.linkedinAnalysisId,
        github_analysis_id=body.githubAnalysisId,
        api_key=body.apiKey,
        mode=body.mode,
    )
    # Sync with store
    append_chat(conversation_id, "user", body.message)
    append_chat(conversation_id, "bot", reply)
    return ChatMessageResponse(
        reply=reply,
        conversationId=conversation_id,
        source=meta.get("source", "predefined"),
        model=meta.get("model"),
    )


@router.get("/history/{conversation_id}", response_model=ChatHistoryResponse)
async def get_history(conversation_id: str) -> ChatHistoryResponse:
    messages = get_chat_history(conversation_id)
    if not messages:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ChatHistoryResponse(conversationId=conversation_id, messages=messages)
