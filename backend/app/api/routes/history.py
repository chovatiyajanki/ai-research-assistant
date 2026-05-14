from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.chat import Chat

router =  APIRouter()

@router.get("/")
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == current_user.user_id)
        .order_by(Chat.created_at.desc())
        .all()
    )
    return [
        {
            "chat_id": chat.chat_id,
            "chat_question": chat.chat_question,
            "chat_answer": chat.chat_answer,
            "document_id": chat.document_id,
            "created_at": chat.created_at
        }
        for chat in chats
    ]