from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_db
from supabase import Client

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Client = Depends(get_db)):
    """
    Dependency to extract and validate the Supabase JWT token.
    Returns the user dictionary from Supabase Auth.
    """
    if not db:
        raise HTTPException(status_code=500, detail="Database client not initialized")

    token = credentials.credentials
    try:
        # Supabase Python SDK (gotrue) validates the token automatically
        user_response = db.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Establish the session for this specific request's client instance
        db.auth.set_session(token, "dummy_refresh_token")

        return user_response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_admin(user = Depends(get_current_user)):
    """
    Dependency to ensure the user is an admin.
    """
    # Assuming role is stored in user_metadata for simplicity or we could query the profiles table
    role = user.user_metadata.get("role", "donor")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    return user
