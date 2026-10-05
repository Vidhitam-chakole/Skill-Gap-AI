from typing import Optional
from pydantic import BaseModel, Field


class QuizOption(BaseModel):
    id: int
    text: str


class QuizQuestionPublic(BaseModel):
    id: int
    language: str
    difficulty: str  # "Foundation", "Intermediate", "Deep Mechanics"
    concept: str     # e.g., "Pointers & Memory", "Undefined Behavior", "Concurrency"
    question: str
    codeSnippet: Optional[str] = None
    options: list[QuizOption]


class QuizQuestionInternal(QuizQuestionPublic):
    correctIndex: int
    explanation: str


class GenerateQuizRequest(BaseModel):
    language: str
    githubAnalysisId: Optional[str] = None


class GenerateQuizResponse(BaseModel):
    quizId: str
    language: str
    totalQuestions: int = 10
    questions: list[QuizQuestionPublic]
    detectedLanguages: list[str] = Field(default_factory=list)


class SubmitQuizRequest(BaseModel):
    quizId: str
    language: str
    answers: dict[int, int]  # questionId -> selectedOptionIndex (0..3)
    timeSpentSeconds: Optional[int] = 0


class ConceptScore(BaseModel):
    concept: str
    correct: int
    total: int
    percentage: int


class QuestionReviewItem(BaseModel):
    id: int
    question: str
    codeSnippet: Optional[str] = None
    options: list[str]
    selectedIndex: Optional[int] = None
    correctIndex: int
    isCorrect: bool
    explanation: str
    concept: str


class QuizEvaluationResult(BaseModel):
    quizId: str
    language: str
    score: int
    totalQuestions: int = 10
    percentage: int
    authenticityStatus: str  # "VERIFIED_AUTHENTIC", "LIKELY_AI_AUGMENTED", "UNVERIFIED_SUSPECT_AI"
    authenticityLabel: str
    badge: str
    summary: str
    aiDetectionInsight: str
    conceptBreakdown: list[ConceptScore]
    recommendations: list[str]
    detailedReview: list[QuestionReviewItem]
