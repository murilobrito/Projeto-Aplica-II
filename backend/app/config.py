from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./ecotriagem.db"

    jwt_secret: str = "troque-este-segredo"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    # "mock" = predições falsas (independe do modelo); "http" = serviço real.
    inference_mode: str = "mock"
    inference_url: str = "http://localhost:8001"

    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    seed_password: str = "123456"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
