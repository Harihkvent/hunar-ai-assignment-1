import json
import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from workspace root or current directory
root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
backend_env = Path(__file__).resolve().parent.parent.parent / ".env"

if root_env.exists():
    load_dotenv(dotenv_path=root_env)
elif backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
else:
    load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "Hunar AI Hiring Assistant"
    API_V1_STR: str = "/api"
    HUNAR_API_KEY: str = os.getenv("HUNAR_API_KEY", "")
    HUNAR_BASE_URL: str = os.getenv("HUNAR_BASE_URL", "https://api.voice.hunar.ai/external/v1")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./hiring_assistant.db")
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    WEBHOOK_BASE_URL: str = os.getenv("WEBHOOK_BASE_URL", "")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            try:
                return json.loads(v)
            except Exception:
                return [v]
        elif isinstance(v, list):
            return v
        return ["*"]

    class Config:
        case_sensitive = True
        extra = "ignore"


settings = Settings()
