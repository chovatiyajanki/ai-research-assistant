from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base

class Chat(Base):
    __tablename__ = "chats"

    chat_id = Column(Integer, primary_key=True, index=True)

    chat_question = Column(Text)
    chat_answer = Column(Text)

    user_id = Column(
        Integer, 
        ForeignKey("users.user_id",ondelete="CASCADE")
        )
    
    document_id = Column(
        Integer, 
        ForeignKey("documents.document_id",ondelete='CASCADE')
        )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # ORM relationship
    user = relationship("User", back_populates="chats")
    document =  relationship("Document", back_populates="chats")