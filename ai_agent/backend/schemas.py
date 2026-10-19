from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(min_length=1)
    conversationId: str | None = None
    linkedinAnalysisId: str | None = None
    githubAnalysisId: str | None = None
    apiKey: str | None = None
    mode: str | None = None  # "auto", "groq", "predefined"


class ChatMessageResponse(BaseModel):
    reply: str
    conversationId: str
    source: str | None = "predefined"  # "groq", "openai", "predefined"
    model: str | None = None


class ChatConfigResponse(BaseModel):
    groqConfigured: bool
    model: str
    supportedModels: list[str]


class ChatHistoryResponse(BaseModel):
    conversationId: str
    messages: list[dict[str, str]]
