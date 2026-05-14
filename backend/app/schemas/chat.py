from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    doc_id: int
    question: str

class ChatResponse(BaseModel):
    chat_id: int
    answer: str

class ChatHistory(BaseModel):
    chat_id: int 
    chat_question: str
    chat_answer: str

    class Config:
        from_attributes = True

class ChatUpdate(BaseModel):
    chat_question: Optional[str] = None
    chat_answer: Optional[str] = None 
