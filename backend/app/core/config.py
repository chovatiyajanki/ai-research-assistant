# from pydantic_settings import BaseSettings,SettingsConfigDict
# # from pathlib import Path

# # BASE_DIR= Path(__file__).resolve().parent.parent.parent.parent

# class Settings(BaseSettings):
#     DATABASE_URL: str
#     SECRET_KEY: str
#     ALGORITHM: str
#     ACCESS_TOKEN_EXPIRE_MINUTES: int

#     # model_config = SettingsConfigDict(
#     #     env_file=BASE_DIR / ".env",
#     #     env_file_encoding="utf-8"
#     # )

# settings = Settings()

from pydantic_settings import BaseSettings
import os

print("=== ENV DEBUG ===")
print("DATABASE_URL =", os.environ.get("DATABASE_URL"))
print("SECRET_KEY =", os.environ.get("SECRET_KEY"))
print("ALGORITHM =", os.environ.get("ALGORITHM"))
print("ACCESS_TOKEN_EXPIRE_MINUTES =", os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES"))
print("=== END DEBUG ===")

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

settings = Settings()