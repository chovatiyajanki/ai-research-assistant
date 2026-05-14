from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatHistory,
    ChatUpdate
)

from app.api.deps import get_current_user
from app.models.user import User
from app.services.query_service import ask_question
from app.db.session import get_db
from app.crud.chat import create_chat, get_chat_history
from app.models.chat import Chat

router = APIRouter()


# Ask Question + Save Chat
@router.post("/ask", response_model=ChatResponse)
def ask(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        # Generate AI Answer
        chat_answer = ask_question(
            request.doc_id,
            request.question
        )

        # Save Chat
        new_chat = create_chat(
            db=db,
            chat_question=request.question,
            chat_answer=chat_answer,
            user_id=current_user.user_id,
            document_id=request.doc_id
        )

        return {
            "chat_id": new_chat.chat_id,
            "answer": chat_answer
        }

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# Get Chat History
@router.get("/history/{doc_id}", response_model=list[ChatHistory])
def history(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return get_chat_history(
        db,
        current_user.user_id,
        doc_id
    )


# Delete Full Chat History By Document
@router.delete("/history/{doc_id}")
def delete_chat_history(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chats = db.query(Chat).filter(
        Chat.document_id == doc_id,
        Chat.user_id == current_user.user_id
    ).all()

    if not chats:

        raise HTTPException(
            status_code=404,
            detail="Chat history not found"
        )

    for chat in chats:
        db.delete(chat)

    db.commit()

    return {
        "message": "Chat history deleted successfully"
    }


# Delete Single Chat
@router.delete("/single/{chat_id}")
def delete_single_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = db.query(Chat).filter(
        Chat.chat_id == chat_id,
        Chat.user_id == current_user.user_id
    ).first()

    if not chat:

        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    db.delete(chat)
    db.commit()

    return {
        "message": "Chat deleted successfully"
    }


# Update Chat
@router.patch("/{chat_id}")
def update_chat(
    chat_id: int,
    payload: ChatUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = db.query(Chat).filter(
        Chat.chat_id == chat_id,
        Chat.user_id == current_user.user_id
    ).first()

    if not chat:

        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    try:

        if payload.chat_question is not None:

            # Update Question
            chat.chat_question = payload.chat_question

            # Regenerate AI Answer
            new_answer = ask_question(
                chat.document_id,
                payload.chat_question
            )

            # Update Answer
            chat.chat_answer = new_answer

        db.commit()
        db.refresh(chat)

        return {
            "message": "Chat updated successfully",
            "chat": chat
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )