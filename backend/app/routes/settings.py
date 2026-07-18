from fastapi import APIRouter, Depends, HTTPException
from app.schemas.settings_schema import NotificationPreferencesUpdate, AIThresholdSettingsUpdate, PickupPreferencesUpdate
from app.database import get_db
from app.core.security import get_current_user
from supabase import Client

router = APIRouter(prefix="/api/settings", tags=["Settings"])

def upsert_settings(db: Client, table: str, user_id: str, data: dict):
    # Try to update first
    response = db.table(table).update(data).eq("user_id", user_id).execute()
    if not response.data:
        # If no data updated, it might not exist, so insert
        data["user_id"] = user_id
        response = db.table(table).insert(data).execute()
    return response.data[0] if response.data else None

@router.get("/")
def get_all_settings(db: Client = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        user_id = current_user.id
        notifications = db.table("notification_preferences").select("*").eq("user_id", user_id).execute().data
        ai_thresholds = db.table("ai_threshold_settings").select("*").eq("user_id", user_id).execute().data
        pickup_prefs = db.table("pickup_preferences").select("*").eq("user_id", user_id).execute().data

        return {
            "success": True,
            "message": "Settings retrieved",
            "data": {
                "notifications": notifications[0] if notifications else {},
                "ai_thresholds": ai_thresholds[0] if ai_thresholds else {},
                "pickup_preferences": pickup_prefs[0] if pickup_prefs else {}
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/notifications")
def update_notifications(prefs: NotificationPreferencesUpdate, db: Client = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        update_dict = prefs.model_dump(exclude_unset=True)
        if not update_dict:
            return {"success": True, "message": "No changes provided"}
        result = upsert_settings(db, "notification_preferences", current_user.id, update_dict)
        return {"success": True, "message": "Notification preferences updated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/ai-thresholds")
def update_ai_thresholds(prefs: AIThresholdSettingsUpdate, db: Client = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        update_dict = prefs.model_dump(exclude_unset=True)
        if not update_dict:
            return {"success": True, "message": "No changes provided"}
        result = upsert_settings(db, "ai_threshold_settings", current_user.id, update_dict)
        return {"success": True, "message": "AI thresholds updated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/pickup-preferences")
def update_pickup_preferences(prefs: PickupPreferencesUpdate, db: Client = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        update_dict = prefs.model_dump(exclude_unset=True)
        if not update_dict:
            return {"success": True, "message": "No changes provided"}
        result = upsert_settings(db, "pickup_preferences", current_user.id, update_dict)
        return {"success": True, "message": "Pickup preferences updated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
