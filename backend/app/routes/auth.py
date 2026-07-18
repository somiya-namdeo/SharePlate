from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import UserSignup, UserLogin, ChangePassword
from app.database import get_db
from app.core.security import get_current_user
from supabase import Client
from typing import Any

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signup")
def signup(user_data: UserSignup, db: Client = Depends(get_db)) -> Any:
    try:
        response = db.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name,
                    "role": user_data.role
                }
            }
        })
        return {
            "success": True,
            "message": "User registered successfully.",
            "data": response.user.model_dump() if response.user else None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(user_data: UserLogin, db: Client = Depends(get_db)) -> Any:
    try:
        response = db.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "user": response.user.model_dump() if response.user else None,
                "session": response.session.model_dump() if response.session else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout")
def logout(db: Client = Depends(get_db), current_user = Depends(get_current_user)) -> Any:
    try:
        # Note: In a stateless JWT setup, logout on the server mainly invalidates the token locally if it's stateful
        # but supabase SDK signs out the current session. Since this is an API using Bearer tokens,
        # real logout happens on the client by deleting the token. We call sign_out just in case.
        db.auth.sign_out()
        return {
            "success": True,
            "message": "Logged out successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
def get_current_user_info(current_user = Depends(get_current_user)) -> Any:
    return {
        "success": True,
        "message": "Current user retrieved",
        "data": current_user.model_dump()
    }

@router.post("/refresh")
def refresh_session(refresh_token: str, db: Client = Depends(get_db)) -> Any:
    try:
        response = db.auth.refresh_session(refresh_token)
        return {
            "success": True,
            "message": "Session refreshed",
            "data": response.session.model_dump() if response.session else None
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Failed to refresh session")

@router.put("/change-password")
def change_password(data: ChangePassword, db: Client = Depends(get_db), current_user = Depends(get_current_user)) -> Any:
    try:
        # Verify old password by attempting to sign in
        try:
            db.auth.sign_in_with_password({
                "email": current_user.email,
                "password": data.old_password
            })
        except Exception:
            # If sign-in fails, the old password is incorrect
            return {
                "success": False,
                "message": "Incorrect old password"
            }

        # If old password is correct, update to new password
        db.auth.update_user({"password": data.new_password})
        return {
            "success": True,
            "message": "Password updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

