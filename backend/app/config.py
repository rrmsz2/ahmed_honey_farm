"""Application settings, loaded from environment variables (and an optional `.env` file)."""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Core ---
    environment: str = Field(default="production", description="production | development | test")
    mongo_url: str = "mongodb://localhost:27017"
    db_name: str = "honey_farm"
    cors_origins: list[str] = Field(default_factory=list)

    # --- Auth ---
    jwt_secret: str = Field(min_length=32)
    jwt_expire_minutes: int = 480
    admin_username: str = "admin"
    # Used only to create the first admin account when none exists.
    admin_password: str | None = Field(default=None, min_length=10)

    # --- WhatsApp (TextMeBot) ---
    whatsapp_api_url: str = "https://api.textmebot.com/send.php"
    whatsapp_api_key: str | None = None
    admin_phone: str | None = None
    whatsapp_dry_run: bool = False
    admin_notification_delay_seconds: float = 6.0

    # --- OTP & abuse protection ---
    otp_ttl_minutes: int = 5
    otp_max_attempts: int = 5
    otp_resend_cooldown_seconds: int = 60
    orders_per_phone_per_hour: int = 5
    orders_per_ip_per_hour: int = 20
    login_attempts_per_ip_per_15min: int = 10
    unverified_order_ttl_hours: int = 24

    # --- Data ---
    seed_sample_data: bool = True

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return []
            if value.startswith("["):
                return value  # JSON list, let pydantic parse it
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
