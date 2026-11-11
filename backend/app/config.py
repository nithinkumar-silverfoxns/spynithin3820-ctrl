"""Application configuration, loaded from environment / .env."""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = Field(default="SILVERFOXNS JARVIS", alias="APP_NAME")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=True, alias="DEBUG")

    # Blank -> local SQLite file (dev / smoke tests only).
    database_url: str = Field(default="", alias="DATABASE_URL")

    jwt_secret: str = Field(default="dev-insecure-secret-change-me", alias="JWT_SECRET")
    access_token_ttl_minutes: int = Field(default=15, alias="ACCESS_TOKEN_TTL_MINUTES")
    refresh_token_ttl_days: int = Field(default=30, alias="REFRESH_TOKEN_TTL_DAYS")
    fernet_key: str = Field(default="", alias="FERNET_KEY")

    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_realtime_model: str = Field(default="gpt-4o-realtime-preview", alias="OPENAI_REALTIME_MODEL")
    openai_chat_model: str = Field(default="gpt-4o-mini", alias="OPENAI_CHAT_MODEL")
    openai_realtime_voice: str = Field(default="verse", alias="OPENAI_REALTIME_VOICE")

    cors_origins: str = Field(default="http://localhost:8081", alias="CORS_ORIGINS")

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def sqlalchemy_url(self) -> str:
        if self.database_url:
            return self.database_url
        # Dev fallback so the app runs with zero external services.
        return "sqlite:///./jarvis_dev.db"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
