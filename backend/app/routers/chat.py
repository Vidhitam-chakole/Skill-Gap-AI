from fastapi import APIRouter, HTTPException

from app.schemas import ChatHistoryResponse, ChatMessageRequest, ChatMessageResponse
from app.services.chat_service import generate_chat_reply
from app.services.store import get_chat_history

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(body: ChatMessageRequest) -> ChatMessageResponse:
    reply, conversation_id = await generate_chat_reply(
        body.message,
        body.conversationId,
        body.linkedinAnalysisId,
        body.githubAnalysisId,
    )
    return ChatMessageResponse(reply=reply, conversationId=conversation_id)


@router.get("/history/{conversation_id}", response_model=ChatHistoryResponse)
async def get_history(conversation_id: str) -> ChatHistoryResponse:
    messages = get_chat_history(conversation_id)
    if not messages:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ChatHistoryResponse(conversationId=conversation_id, messages=messages)
