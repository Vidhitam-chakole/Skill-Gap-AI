from fastapi import APIRouter, HTTPException

from .schemas import ChatHistoryResponse, ChatMessageRequest, ChatMessageResponse
from .service import generate_agent_reply, get_history

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(body: ChatMessageRequest) -> ChatMessageResponse:
    reply, conversation_id = await generate_agent_reply(
        message=body.message,
        conversation_id=body.conversationId,
        linkedin_analysis_id=body.linkedinAnalysisId,
        github_analysis_id=body.githubAnalysisId,
    )
    return ChatMessageResponse(reply=reply, conversationId=conversation_id)


@router.get("/history/{conversation_id}", response_model=ChatHistoryResponse)
async def get_chat_history_route(conversation_id: str) -> ChatHistoryResponse:
    messages = get_history(conversation_id)
    if not messages:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return ChatHistoryResponse(conversationId=conversation_id, messages=messages)
