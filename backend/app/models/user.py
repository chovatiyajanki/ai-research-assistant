from sqlalchemy  import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=True)
    user_email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")

    # ORM relationship
    chats = relationship(
        "Chat",
        back_populates="user",
        cascade="all, delete",
        passive_deletes=True
    )

    documents = relationship(
        "Document",
        back_populates="user",
        cascade="all, delete",
        passive_deletes=True
    )