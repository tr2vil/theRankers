from urllib.parse import quote_plus

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "theRankers"
    environment: str = "development"
    debug: bool = True

    # Database (individual params to handle special chars in password)
    database_url: str | None = None
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "therankers"
    db_password: str = "therankers_dev"
    db_name: str = "therankers"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Auth
    secret_key: str = "dev-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    algorithm: str = "HS256"

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "extra": "ignore"}

    def get_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        encoded_pw = quote_plus(self.db_password)
        return f"postgresql+asyncpg://{self.db_user}:{encoded_pw}@{self.db_host}:{self.db_port}/{self.db_name}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
