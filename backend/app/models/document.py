from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base

class Document(Base):
    __tablename__ = "documents"

    document_id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String)
    file_path = Column(String)

    user_id = Column(Integer, 
                     ForeignKey("users.user_id",ondelete="CASCADE")
    )

    # ORM relationship
    user = relationship("User", back_populates="documents")

    chats = relationship(
        "Chat",
        back_populates="document",
        cascade="all, delete",
        passive_deletes=True
    )