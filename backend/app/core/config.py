import json
import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from backend directory, workspace root, or current working directory
cwd_env = Path.cwd() / ".env"
backend_env = Path(__file__).resolve().parent.parent.parent / ".env"
root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
elif cwd_env.exists():
    load_dotenv(dotenv_path=cwd_env)
elif root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()


def get_default_db_url() -> str:
    # On Vercel / serverless, filesystem is read-only except /tmp
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return "sqlite:////tmp/hiring_assistant.db"
    return "sqlite:///./hiring_assistant.db"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Hunar AI Hiring Assistant"
    API_V1_STR: str = "/api"
    HUNAR_API_KEY: str = os.getenv("HUNAR_API_KEY", "")
    HUNAR_BASE_URL: str = os.getenv("HUNAR_BASE_URL", "https://api.voice.hunar.ai/external/v1")
    DATABASE_URL: str = os.getenv("DATABASE_URL", get_default_db_url())
    
    # People Search & Enrichment Provider Keys (Optional)
    PDL_API_KEY: str = os.getenv("PDL_API_KEY", "")
    APOLLO_API_KEY: str = os.getenv("APOLLO_API_KEY", "")
    PROXYCURL_API_KEY: str = os.getenv("PROXYCURL_API_KEY", "")
    CORESIGNAL_API_KEY: str = os.getenv("CORESIGNAL_API_KEY", "")

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
            origins = [i.strip().rstrip("/") for i in v.split(",") if i.strip()]
            return origins or ["*"]
        elif isinstance(v, str) and v.startswith("["):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(i).strip().rstrip("/") for i in parsed if str(i).strip()]
                return [str(parsed).strip().rstrip("/")]
            except Exception:
                return [v.strip().rstrip("/")]
        elif isinstance(v, list):
            return [str(i).strip().rstrip("/") for i in v if str(i).strip()]
        return ["*"]

    class Config:
        case_sensitive = True
        extra = "ignore"


settings = Settings()
