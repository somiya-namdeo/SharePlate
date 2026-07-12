from pydantic import BaseModel
from typing import List, Optional

class FilterState(BaseModel):
    period: str
    city: Optional[str]
    category: Optional[str]

class AvailableFilters(BaseModel):
    cities: List[str]
    categories: List[str]

class KPIData(BaseModel):
    value: float
    trend_percent: Optional[float]
    unit: Optional[str] = None

class KPIs(BaseModel):
    successful_rescues: KPIData
    quantity_rescued: KPIData
    meals_fulfilled: KPIData
    ngos_served: KPIData
    active_requests: KPIData
    critical_resolved_percent: KPIData

class TimeSeriesPoint(BaseModel):
    date: str
    count: int

class CategoryDistribution(BaseModel):
    category: str
    count: int
    percentage: float

class SafetyDistribution(BaseModel):
    safety_status: str
    count: int
    percentage: float

class UrgencyDistribution(BaseModel):
    urgency_level: str
    count: int

class CityRequest(BaseModel):
    city: str
    count: int

class OperationalInsights(BaseModel):
    most_donated_category: Optional[str]
    highest_demand_city: Optional[str]
    avg_shelf_life_hrs: Optional[float]
    rescue_completion_rate_percent: Optional[float]
    unsafe_rate_percent: Optional[float]
    ngo_fulfillment_percent: Optional[float]
    critical_requests_today: int

class AnalyticsResponse(BaseModel):
    filters: FilterState
    available_filters: AvailableFilters
    kpis: KPIs
    donations_over_time: List[TimeSeriesPoint]
    food_categories: List[CategoryDistribution]
    safety_distribution: List[SafetyDistribution]
    urgency_distribution: List[UrgencyDistribution]
    requests_by_city: List[CityRequest]
    operational_insights: OperationalInsights
