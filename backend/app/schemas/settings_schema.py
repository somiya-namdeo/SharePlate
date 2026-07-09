from pydantic import BaseModel
from typing import Optional, Dict, Any

class NotificationPreferencesUpdate(BaseModel):
    notifications_enabled: Optional[bool] = None

class AIThresholdSettingsUpdate(BaseModel):
    safety_threshold: Optional[float] = None
    match_score_threshold: Optional[float] = None

class PickupPreferencesUpdate(BaseModel):
    preferred_times: Optional[Dict[str, Any]] = None
    max_distance_km: Optional[float] = None
    vehicle_type: Optional[str] = None
