from pathlib import Path

from pydantic import ValidationError
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    SQL_ECHO: bool = False
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    GROQ_API_KEY: str | None = None
    MODEL_NAME: str = "llama-3.3-70b-versatile"
    WARM_EMBEDDING_MODEL_ON_STARTUP: bool = False
    ALLOWED_ORIGINS: str = (
        "http://localhost:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:5173,"
        "http://192.168.1.9:5173,"
        "https://ai-research-assistant-eosin.vercel.app"
    )
    ALLOWED_ORIGIN_REGEX: str | None = r"https://.*\.vercel\.app"
    UPLOAD_DIR: str = "uploads"
    VECTORSTORE_DIR: str = "vectorstore"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        # Railway and Heroku-style URLs often use postgres://, while SQLAlchemy expects postgresql://.
        if isinstance(value, str) and value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql://", 1)
        return value

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]

    @property
    def upload_dir_path(self) -> Path:
        path = Path(self.UPLOAD_DIR).expanduser()
        return path if path.is_absolute() else BACKEND_DIR / path

    @property
    def vectorstore_dir_path(self) -> Path:
        path = Path(self.VECTORSTORE_DIR).expanduser()
        return path if path.is_absolute() else BACKEND_DIR / path

    model_config = SettingsConfigDict(
        # Keep root .env for local Docker and backend/.env for backend-only development.
        env_file=(ROOT_DIR / ".env", BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


try:
    settings = Settings()
except ValidationError as exc:
    missing_fields = [
        ".".join(str(part) for part in error["loc"])
        for error in exc.errors()
        if error["type"] == "missing"
    ]

    if missing_fields:
        env_files = ", ".join(str(path) for path in (ROOT_DIR / ".env", BACKEND_DIR / ".env"))
        raise RuntimeError(
            f"Missing required environment settings: {', '.join(missing_fields)}. "
            f"Create a local .env file from backend/.env.example. Checked: {env_files}"
        ) from exc

    raise
