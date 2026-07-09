import sys
from supabase import create_client, Client
from app.config import settings

if not settings.supabase_url or not settings.supabase_service_role_key:
    print("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Database operations will fail.")

# Initialize Supabase Client globally
try:
    # Use the SERVICE_ROLE_KEY to bypass RLS for all backend operations
    supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    supabase = None # Will fail later but allows the app to load

def get_db() -> Client:
    """
    Dependency to get the Supabase database connection.
    Returns a fresh client per request to avoid cross-request session leakage.
    Uses SERVICE_ROLE_KEY so the backend can bypass RLS when acting on behalf of users.
    """
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
