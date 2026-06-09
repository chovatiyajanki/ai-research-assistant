from functools import lru_cache

from langchain_community.embeddings import HuggingFaceEmbeddings

from app.core.config import settings


@lru_cache(maxsize=1)
def get_embedding_model():
    return HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL_NAME)
