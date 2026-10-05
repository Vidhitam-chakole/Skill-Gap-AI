from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(min_length=1)
    conversationId: str | None = None
    linkedinAnalysisId: str | None = None
    githubAnalysisId: str | None = None


class ChatMessageResponse(BaseModel):
    reply: str
    conversationId: str


class ChatHistoryResponse(BaseModel):
    conversationId: str
    messages: list[dict[str, str]]
