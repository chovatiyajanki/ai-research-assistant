from app.db.session import engine
from app.db.base import Base
from app.models import user
from app.api.routes import auth, users, documents, chat, history

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from app.core.config import settings

app = FastAPI(
    title="AI Research Assistant",
    description="My AI SaaS Application",
    version="1.0.0"
)

origins = [
    # "http://localhost:5173",
    "https://ai-research-assistant-eosin.vercel.app/",
]

# configure middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

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
