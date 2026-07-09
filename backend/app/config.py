import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "SharePlate API"
    environment: str = os.getenv("ENVIRONMENT", "development")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    class Config:
        env_file = ".env"

settings = Settings()
