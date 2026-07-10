import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.database import get_db

db = get_db()
try:
    response = db.table("donations").select("*").limit(1).execute()
    if response.data:
        print("COLUMNS:")
        for key in response.data[0].keys():
            print(f"- {key}")
    else:
        print("No data in table to infer schema.")
except Exception as e:
    print(f"Error: {e}")
