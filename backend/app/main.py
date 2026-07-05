from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from app.routes import health, donations, requests, matches
from app.config import settings

app = FastAPI(
    title=settings.app_name,
    description="Backend API for SharePlate - Food Redistribution Platform",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], # Common frontend ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(donations.router)
app.include_router(requests.router)
app.include_router(matches.router)

@app.get("/")
def root():
    return {"message": "Welcome to the SharePlate API!"}
