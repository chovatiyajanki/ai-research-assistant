from pathlib import Path
from functools import lru_cache
import logging
import re

from groq import APIStatusError, AuthenticationError
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq

from app.services.embedding_service import get_embedding_model
from app.services.file_parser import extract_text_from_path
from app.services.rag_service import split_text
from app.services.vector_store import create_vector_store
from app.core.config import settings

logger = logging.getLogger(__name__)
NOT_FOUND_ANSWER = "I could not find that information in the uploaded document."
BROKEN_PREFIX_PATTERN = re.compile(r"^(?:[a-z]{2,18}[.:;]\s+|[a-z]{2,18}:\s+(?=\d))")


class DocumentIndexMissingError(ValueError):
    pass


class DocumentFileMissingError(ValueError):
    pass


class LLMConfigurationError(RuntimeError):
    pass


class LLMAuthenticationError(RuntimeError):
    pass


def get_vectorstore_path(doc_id: int):
    return settings.vectorstore_dir_path / str(doc_id)


def load_vectorstore(doc_id: int):
    path = get_vectorstore_path(doc_id)

    if not path.exists():
        raise DocumentIndexMissingError(f"Vectorstore not found for doc_id: {path}")
    
    embeddings = get_embedding_model()

    return FAISS.load_local(
        str(path),
        embeddings,
        allow_dangerous_deserialization=True
    )


def resolve_document_file_path(file_path: str | None):
    if not file_path:
        return None

    # Older rows may store absolute paths, uploads/foo.pdf, or only the generated filename.
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

    # Rebuild missing FAISS indexes from the original upload after redeploys or volume resets.
    extracted_text = extract_text_from_path(resolved_path, file_name)

    if not extracted_text.strip():
        raise ValueError("No readable text found in the uploaded document. Please upload a readable file.")

    chunks = split_text(extracted_text)
    create_vector_store(chunks, doc_id)

@lru_cache(maxsize=1)
def get_llm():
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your-groq-api-key":
        raise LLMConfigurationError("Set a valid GROQ_API_KEY in backend/.env and restart the backend.")

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


def normalize_query(query: str):
    if re.search(r"\bml\b", query, flags=re.IGNORECASE):
        return re.sub(r"\bml\b", "machine learning", query, flags=re.IGNORECASE)

    return query


def clean_context_text(text: str):
    cleaned = " ".join(text.split())
    cleaned = re.sub(r"--- Page \d+ ---", "", cleaned).strip()

    # Chunks can start in the middle of a word because of overlap; remove obvious fragments.
    return BROKEN_PREFIX_PATTERN.sub("", cleaned).strip()


def build_context(docs):
    excerpts = []

    for index, doc in enumerate(docs, start=1):
        text = clean_context_text(doc.page_content)

        if text:
            excerpts.append(f"Source {index}: {text}")

    return "\n\n".join(excerpts)


def build_prompt(query: str, context: str):
    return [
        (
            "system",
            "You are an AI Research Assistant. Answer using only the uploaded document context. "
            "Write a clean, direct answer. Do not copy page markers, broken word fragments, "
            "or unrelated context. If the context does not contain the answer, reply exactly: "
            f"{NOT_FOUND_ANSWER}",
        ),
        (
            "human",
            f"Document context:\n{context}\n\nQuestion: {query}",
        ),
    ]


def normalize_llm_answer(answer: str | None):
    cleaned = " ".join((answer or "").split())
    cleaned = BROKEN_PREFIX_PATTERN.sub("", cleaned).strip()

    if not cleaned:
        return NOT_FOUND_ANSWER

    if NOT_FOUND_ANSWER.lower() in cleaned.lower() and cleaned.lower() != NOT_FOUND_ANSWER.lower():
        return NOT_FOUND_ANSWER

    # Very short fragments usually come from noisy extraction or partial retrieved text.
    if len(cleaned) < 20 and NOT_FOUND_ANSWER.lower() not in cleaned.lower():
        return NOT_FOUND_ANSWER

    return cleaned


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

    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    
    retrieval_query = normalize_query(query)
    docs = retriever.invoke(retrieval_query)

    context = build_context(docs)

    if not context:
        return NOT_FOUND_ANSWER

    try:
        llm = get_llm()

        response = llm.invoke(build_prompt(query, context))

        return normalize_llm_answer(response.content)

    except AuthenticationError as exc:
        raise LLMAuthenticationError("Groq rejected the API key. Add a valid GROQ_API_KEY in backend/.env and restart the backend.") from exc
    except APIStatusError as exc:
        if exc.status_code in {400, 401, 403}:
            raise LLMAuthenticationError("Groq rejected the API request. Check GROQ_API_KEY and MODEL_NAME in backend/.env.") from exc

        logger.exception("Groq LLM request failed; returning retrieved document excerpts instead.")
        return build_context_answer(query, docs)
    except LLMConfigurationError:
        raise
    except Exception:
        logger.exception("Groq LLM request failed; returning retrieved document excerpts instead.")
        return build_context_answer(query, docs)
