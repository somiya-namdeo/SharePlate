from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Literal

class FoodSafetyRequest(BaseModel):
    food_item: str
    food_category: str
    preparation_method: str
    storage_condition: str
    packaging_type: str
    temperature_c: float
    humidity_percent: float
    hours_since_prepared: float
    estimated_transport_time_hr: float
    distance_km: float
    quantity_kg: float
    season: str
    event_type: str
    city_tier: str
    perishability_score: int
    estimated_shelf_life_hr: float

class FoodSafetyResponse(BaseModel):
    prediction: str
    remaining_shelf_life_hr: float
    urgency_score: float
    urgency_level: Literal["Low", "Medium", "High", "Critical"]
    urgency_priority: int

class SurplusPredictionRequest(BaseModel):
    features: Dict[str, Any] = Field(default_factory=dict, description="Dictionary of input features for the surplus prediction model")

class SurplusPredictionResponse(BaseModel):
    predicted_surplus_quantity: float

class DemandForecastRequest(BaseModel):
    features: Dict[str, Any] = Field(default_factory=dict, description="Dictionary of input features for the demand forecasting model")

class DemandForecastResponse(BaseModel):
    predicted_demand: float

class DonationNERRequest(BaseModel):
    text: str

class DonationNERResponse(BaseModel):
    food_item: Optional[str] = None
    quantity: Optional[str] = None
    location: Optional[str] = None
    pickup_time: Optional[str] = None
