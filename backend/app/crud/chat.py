from sqlalchemy.orm import Session
from app.models.chat import Chat

def create_chat(db: Session, chat_question: str, chat_answer: str, user_id: int, document_id: int):
    chat = Chat(
        chat_question=chat_question,
        chat_answer=chat_answer,
        user_id=user_id,
        document_id=document_id
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)

    return chat

def get_chat_history(db: Session, user_id: int, document_id: int):
    return db.query(Chat).filter(
        Chat.user_id == user_id,
        Chat.document_id == document_id
    ).all()