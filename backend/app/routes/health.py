from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def health_check():
    """
    Basic health check endpoint.
    """
    return {"status": "healthy", "service": "SharePlate API"}
