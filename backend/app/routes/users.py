from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.schemas.user_schema import ProfileUpdate
from app.database import get_db
from app.core.security import get_current_user
from supabase import Client
import uuid

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/profile")
def get_profile(db: Client = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        response = db.table("profiles").select("*").eq("id", current_user.id).execute()
        profile = response.data[0] if response.data else None
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return {
            "success": True,
            "message": "Profile retrieved",
            "data": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile")
def update_profile(profile_data: ProfileUpdate, db: Client = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        update_dict = profile_data.model_dump(exclude_unset=True)
        if not update_dict:
            return {"success": True, "message": "No changes provided", "data": None}

        response = db.table("profiles").update(update_dict).eq("id", current_user.id).execute()
        updated_profile = response.data[0] if response.data else None

        return {
            "success": True,
            "message": "Profile updated",
            "data": updated_profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), db: Client = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        file_ext = file.filename.split(".")[-1]
        file_name = f"{current_user.id}/{uuid.uuid4()}.{file_ext}"

        # We assume a bucket named "avatars" exists and is public
        contents = await file.read()
        res = db.storage.from_("avatars").upload(
            file=contents,
            path=file_name,
            file_options={"content-type": file.content_type}
        )

        # Get public URL
        public_url = db.storage.from_("avatars").get_public_url(file_name)

        # Update profile
        db.table("profiles").update({"avatar_url": public_url}).eq("id", current_user.id).execute()

        return {
            "success": True,
            "message": "Avatar uploaded",
            "data": {"avatar_url": public_url}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
