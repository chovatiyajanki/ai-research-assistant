from langchain_community.vectorstores import FAISS
from app.services.embedding_service import get_embedding_model
import os

def create_vector_store(chunks,doc_id):
    embeddings = get_embedding_model()

    vectorstore = FAISS.from_documents(chunks, embeddings)

    # create folder per doc_id
    path = f"vectorstore/{doc_id}"
    os.makedirs(path,exist_ok=True)

    # Save vectorstore to disk
    vectorstore.save_local(path)

    return path