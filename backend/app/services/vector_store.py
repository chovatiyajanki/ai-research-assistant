from langchain_community.vectorstores import FAISS
from app.services.embedding_service import get_embedding_model
from app.core.config import settings

def create_vector_store(chunks,doc_id):
    embeddings = get_embedding_model()

    vectorstore = FAISS.from_documents(chunks, embeddings)

    # create folder per doc_id
    path = settings.vectorstore_dir_path / str(doc_id)
    path.mkdir(parents=True, exist_ok=True)

    # Save vectorstore to disk
    vectorstore.save_local(str(path))

    return str(path)
