import uuid
from datetime import datetime
from fastapi import APIRouter
from app.schemas.request_schema import RequestCreate, RequestResponse
from app.database import REQUESTS_DB

router = APIRouter(prefix="/api/requests", tags=["NGO Requests"])

@router.post("/", response_model=RequestResponse)
def create_request(request: RequestCreate):
    """
    Create a new food request for an NGO and store it in memory.
    """
    new_request = {
        "id": str(uuid.uuid4()),
        "status": "open",
        "created_at": datetime.utcnow(),
        **request.model_dump()
    }
    REQUESTS_DB.append(new_request)
    return new_request

@router.get("/", response_model=list[RequestResponse])
def get_requests():
    """
    List all open NGO requests from memory.
    """
    return REQUESTS_DB
