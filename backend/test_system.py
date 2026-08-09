import requests
from db import get_connection

print("=== 1. Checking Database Tables ===")
conn = get_connection()
if conn:
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES;")
    tables = [t[0] for t in cursor.fetchall()]
    print(f"Tables in database ({len(tables)}): {tables}")
    
    # Check student_profiles columns
    cursor.execute("DESCRIBE student_profiles;")
    sp_cols = [c[0] for c in cursor.fetchall()]
    print(f"student_profiles columns: {sp_cols}")
    
    # Check verification columns
    cursor.execute("DESCRIBE verification;")
    v_cols = [c[0] for c in cursor.fetchall()]
    print(f"verification columns: {v_cols}")
    
    cursor.close()
    conn.close()
else:
    print("❌ DB Connection Failed!")

print("\n=== 2. Checking Backend Endpoints ===")
BASE_URL = "http://127.0.0.1:8000"

try:
    r = requests.get(f"{BASE_URL}/ping-db")
    print(f"GET /ping-db -> {r.status_code}: {r.text}")
except Exception as e:
    print(f"GET /ping-db failed: {e}")

try:
    r = requests.get(f"{BASE_URL}/api/sectors")
    print(f"GET /api/sectors -> {r.status_code}: {r.text[:100]}")
except Exception as e:
    print(f"GET /api/sectors failed: {e}")

try:
    r = requests.get(f"{BASE_URL}/api/roles")
    print(f"GET /api/roles -> {r.status_code}: {r.text[:100]}")
except Exception as e:
    print(f"GET /api/roles failed: {e}")

try:
    r = requests.get(f"{BASE_URL}/api/locations")
    print(f"GET /api/locations -> {r.status_code}: {r.text[:100]}")
except Exception as e:
    print(f"GET /api/locations failed: {e}")

try:
    r = requests.post(f"{BASE_URL}/send-otp", json={"aadhaar": "111122223333"})
    print(f"POST /send-otp (111122223333) -> {r.status_code}: {r.text}")
except Exception as e:
    print(f"POST /send-otp failed: {e}")
