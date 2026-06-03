from fastapi import APIRouter, Depends, UploadFile, File
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.crud.document import create_document, get_user_documents
from app.utils.file_handler import save_file

from app.schemas.document import DocumentResponse

from app.services.rag_service import split_text
from app.services.file_parser import extract_text
from app.services.vector_store import create_vector_store

from app.models.document import Document
from app.models.chat import Chat

import os
import shutil

router = APIRouter()

# Upload Document
# @router.post("/upload", response_model=DocumentResponse)
# def upload_document(
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     file_path = save_file(file)

#     doc = create_document(
#         db,
#         file_name=file.filename,
#         file_path=file_path,
#         user_id=current_user.user_id
#     )
#     return doc

# Get Document
@router.get("/", response_model=list[DocumentResponse])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_documents(db, current_user.user_id)

# Connect RAG with Upload
@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Save file
        file_path = save_file(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Save in database
    doc = create_document(
        db,
        file_name=file.filename,
        file_path=file_path,
        user_id=current_user.user_id
    )

    # RAG Processing
    # Reset file pointer after save
    file.file.seek(0)

    try:
        # Extrect text
        extracted_text = await extract_text(file)
    except ValueError as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        db.delete(doc)
        db.commit()
        raise HTTPException(status_code=400, detail=str(e))

    if not extracted_text.strip():
        if os.path.exists(file_path):
            os.remove(file_path)
        db.delete(doc)
        db.commit()
        raise HTTPException(status_code=400, detail="No readable text found in file")

    try:
        # Split Text  into chunks
        chunks = split_text(extracted_text  )

        # Create vector store 
        vectorstore = create_vector_store(chunks,doc.document_id)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        vectorstore_path = os.path.join("vectorstore", str(doc.document_id))
        if os.path.exists(vectorstore_path):
            shutil.rmtree(vectorstore_path)
        db.delete(doc)
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(e)}"
        )

    # Save vectorstore locally
    # folder_path = f"vectorstore/{doc.document_id}"
    # os.makedirs(folder_path, exist_ok=True)
    
    # vectorstore.save_local(folder_path)

    return {
        "message" : "Uploaded and processed succcessfully",
        "doc_id" : doc.document_id,
        "file_name": doc.file_name
        } 

# @router.delete("/documents/{doc_id}")
@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.document_id == doc_id,
        Document.user_id == current_user.user_id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document Not Found")

    file_path = document.file_path
    vectorstore_path = os.path.join("vectorstore", str(doc_id))
    
    # Delete related chats First
    db.query(Chat).filter(
        Chat.document_id == doc_id
    ).delete()

    # After that delete document
    db.delete(document)
    db.commit()

    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    if os.path.exists(vectorstore_path):
        shutil.rmtree(vectorstore_path)

    return {
        "message": "Document Deleted"
    }
