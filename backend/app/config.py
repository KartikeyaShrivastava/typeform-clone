"""Application configuration loaded from environment variables."""
from functools import lru_cache

from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./typeform.db")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    @property
    def async_database_url(self) -> str:
        """Convert a sync sqlite URL into an aiosqlite URL for the async engine."""
        if self.DATABASE_URL.startswith("sqlite:///"):
            return self.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
        return self.DATABASE_URL


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
