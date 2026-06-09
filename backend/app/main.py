from app.db.session import engine
from app.db.base import Base
from app.models import user
from app.api.routes import auth, users, documents, chat, history

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from app.core.config import settings
from app.services.embedding_service import get_embedding_model

app = FastAPI(
    title="AI Research Assistant",
    description="My AI SaaS Application",
    version="1.0.0"
)

origins = [
    "https://ai-research-assistant-eosin.vercel.app",  # your frontend domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    if settings.WARM_EMBEDDING_MODEL_ON_STARTUP:
        get_embedding_model()

@app.get("/")
def root():
    return {"message" : "API is running"}

# Authentication
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
    
# Users
app.include_router(users.router, prefix="/users", tags=["Users"]) 

# Documents
app.include_router(documents.router, prefix="/documents", tags=["Documents"])

# Chats 
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

# Chat all document History
app.include_router(history.router,prefix="/history",tags=["History"])
