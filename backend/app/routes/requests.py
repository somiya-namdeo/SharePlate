from fastapi import APIRouter, Depends, HTTPException
from app.schemas.request_schema import RequestCreate
from app.database import get_db
from app.core.security import get_current_user
from app.services.requests_service import RequestsService
from supabase import Client

router = APIRouter(prefix="/api/requests", tags=["NGO Requests"])

def get_requests_service(db: Client = Depends(get_db)):
    return RequestsService(db)

@router.post("/")
def create_request(
    request: RequestCreate, 
    service: RequestsService = Depends(get_requests_service),
    current_user = Depends(get_current_user)
):
    try:
        ngo_id = current_user.id
        result = service.create_request(request.model_dump(), ngo_id)
        return {
            "success": True,
            "message": "Request created successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_requests(service: RequestsService = Depends(get_requests_service)):
    try:
        result = service.get_requests()
        return {
            "success": True,
            "message": "Requests retrieved successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
