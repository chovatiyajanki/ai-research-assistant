from sqlalchemy.orm import Session
from app.models.document import Document

def create_document(db: Session, file_name: str, file_path: str, user_id: int):
    doc = Document(
        file_name=file_name,
        file_path=file_path,
        user_id=user_id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return doc

def get_user_documents(db: Session, user_id: int):
    return  db.query(Document).filter(Document.user_id == user_id).all()

def get_user_document(db: Session, document_id: int, user_id: int):
    return (
        db.query(Document)
        .filter(
            Document.document_id == document_id,
            Document.user_id == user_id
        )
        .first()
    )
