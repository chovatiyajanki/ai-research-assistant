from langchain_community.vectorstores import FAISS
from langchain_community.llms import Ollama
import os

from app.services.embedding_service import get_embedding_model

def load_vectorstore(doc_id: int):
    path = f"vectorstore/{doc_id}"

    if not os.path.exists(path):
        raise ValueError(f"Vectorstore not found for doc_id: {path}")
    
    embeddings =get_embedding_model()

    return FAISS.load_local(
        path, 
        embeddings,
        allow_dangerous_deserialization=True
        )

def get_llm():
    return Ollama(model="llama3")

def ask_question(doc_id: int, query: str):
    vectorstore = load_vectorstore(doc_id)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    docs = retriever.invoke(query)

    context = "\n\n".join([doc.page_content for doc in docs])

    llm = get_llm()

    prompt = f"""
    Answer the question based on the context below.

    Context:
    {context}

    Question:
    {query}

    Answer:
    """

    response = llm.invoke(prompt)
    return str(response)
