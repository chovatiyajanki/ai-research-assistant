from app.core.config import settings
from app.services.embedding_service import get_embedding_model
from langchain_community.vectorstores import FAISS


def create_vector_store(chunks, doc_id):
    embeddings = get_embedding_model()
    vectorstore = FAISS.from_documents(chunks, embeddings)

    path = settings.vectorstore_dir_path / str(doc_id)
    path.mkdir(parents=True, exist_ok=True)

    # Store each FAISS index separately so a single document can be rebuilt or deleted.
    vectorstore.save_local(str(path))

    return str(path)
