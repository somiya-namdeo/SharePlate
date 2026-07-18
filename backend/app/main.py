from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Import routers
from app.routes import health, donations, requests, matches, ai, auth, users, settings as settings_routes, analytics
from app.config import settings

app = FastAPI(
    title=settings.app_name,
    description="Backend API for SharePlate - Food Redistribution Platform",
    version="1.0.0"
)

# CORS middleware configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Production frontend URL (replace with actual Vercel URL after deployment)
    "https://your-frontend.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Exception Handling for Standardized JSON Responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail), "data": None},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Validation Error", "data": exc.errors()},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal Server Error", "data": str(exc)},
    )

# Include routers
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(settings_routes.router)
app.include_router(donations.router)
app.include_router(requests.router)
app.include_router(matches.router)
app.include_router(ai.router)
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
@app.get("/")
def root():
    return {"success": True, "message": "Welcome to the SharePlate API!", "data": None}
