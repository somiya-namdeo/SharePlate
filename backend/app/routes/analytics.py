from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.services.analytics_service import AnalyticsService
from app.database import get_db
from supabase import Client
from app.schemas.analytics_schema import AnalyticsResponse

router = APIRouter()

def get_analytics_service(db: Client = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(db)

@router.get("", response_model=AnalyticsResponse)
def get_analytics(
    period: str = Query("30d", description="Filter period: 7d, 30d, 90d, all"),
    city: Optional[str] = Query(None, description="Filter by city"),
    category: Optional[str] = Query(None, description="Filter by food category"),
    service: AnalyticsService = Depends(get_analytics_service)
):
    return service.get_analytics_dashboard(period=period, city=city, category=category)
