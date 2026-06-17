from pathlib import Path
from functools import lru_cache

from langchain_community.vectorstores import FAISS
# from langchain_community.llms import Ollama
from langchain_groq import ChatGroq

from app.services.embedding_service import get_embedding_model
from app.services.file_parser import extract_text_from_path
from app.services.rag_service import split_text
from app.services.vector_store import create_vector_store
from app.core.config import settings


class DocumentIndexMissingError(ValueError):
    pass


class DocumentFileMissingError(ValueError):
    pass


def get_vectorstore_path(doc_id: int):
    return settings.vectorstore_dir_path / str(doc_id)


def load_vectorstore(doc_id: int):
    path = get_vectorstore_path(doc_id)

    if not path.exists():
        raise DocumentIndexMissingError(f"Vectorstore not found for doc_id: {path}")
    
    embeddings =get_embedding_model()

    return FAISS.load_local(
        str(path),
        embeddings,
        allow_dangerous_deserialization=True
        )


def resolve_document_file_path(file_path: str | None):
    if not file_path:
        return None

    normalized_file_path = file_path.replace("\\", "/")
    stored_path = (
        settings.upload_dir_path.parent / normalized_file_path
        if normalized_file_path.startswith("uploads/")
        else None
    )
    candidates = [
        settings.upload_dir_path / normalized_file_path,
        settings.upload_dir_path / normalized_file_path.split("/")[-1],
        settings.upload_dir_path.parent / normalized_file_path,
    ]

    if stored_path:
        candidates.insert(0, stored_path)

    direct_path = Path(file_path).expanduser()
    if direct_path.is_absolute():
        candidates.insert(0, direct_path)

    for candidate in candidates:
        if candidate.exists():
            return candidate

    return None


def rebuild_vectorstore(doc_id: int, file_path: str | None, file_name: str | None):
    resolved_path = resolve_document_file_path(file_path)

    if not resolved_path:
        raise DocumentFileMissingError(
            "Document index is missing and the uploaded file was not found on the server. "
            "Please upload the document again."
        )

    extracted_text = extract_text_from_path(resolved_path, file_name)

    if not extracted_text.strip():
        raise ValueError("No readable text found in the uploaded document. Please upload a readable file.")

    chunks = split_text(extracted_text)
    create_vector_store(chunks, doc_id)

# @lru_cache(maxsize=1)
# def get_llm():
#     # return Ollama(model="llama3")
#     kwargs = {"model": settings.OLLAMA_MODEL}

#     if settings.OLLAMA_BASE_URL:
#         kwargs["base_url"] = settings.OLLAMA_BASE_URL

#     return Ollama(**kwargs)
@lru_cache(maxsize=1)
def get_llm():

    return ChatGroq(
        model=settings.MODEL_NAME,
        api_key=settings.GROQ_API_KEY,
        temperature=0.1,
    )

def build_context_answer(query: str, docs):
    if not docs:
        return (
            "I found the document index, but no relevant text matched your question. "
            "Try asking with more specific words from the document."
        )

    excerpts = []

    for index, doc in enumerate(docs, start=1):
        text = " ".join(doc.page_content.split())
        if len(text) > 900:
            text = f"{text[:900]}..."
        excerpts.append(f"{index}. {text}")

    return (
        "I could not connect to the configured LLM service, so I returned the most relevant "
        "document excerpts instead.\n\n"
        f"Question: {query}\n\n"
        "Relevant excerpts:\n"
        + "\n\n".join(excerpts)
    )

def ask_question(doc_id: int, query: str, file_path: str | None = None, file_name: str | None = None):
    try:
        vectorstore = load_vectorstore(doc_id)
    except DocumentIndexMissingError:
        rebuild_vectorstore(doc_id, file_path, file_name)
        try:
            vectorstore = load_vectorstore(doc_id)
        except DocumentIndexMissingError as exc:
            raise DocumentFileMissingError(
                "Document index could not be rebuilt. Please upload the document again."
            ) from exc

    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    docs = retriever.invoke(query)

    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = f"""
    You are an AI Research Assistant.

    Answer ONLY using the provided context.

    If the answer is not in the context, say:

    'I could not find that information in the uploaded document.'

    Context:
    {context}

    Question:
    {query}

    Answer:
    """


    try:
        llm = get_llm()
        response = llm.invoke(prompt)
        return str(response)
    except Exception:
        return build_context_answer(query, docs)
