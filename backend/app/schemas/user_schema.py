from pydantic import BaseModel, EmailStr
from typing import Optional

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    avatar_url: Optional[str] = None
