import requests

BASE_URL = "http://127.0.0.1:8000"

print("=== Testing OTP Endpoints ===")
try:
    r = requests.post(f"{BASE_URL}/send-otp", json={"aadhaar": "111122223333"})
    print(f"POST /send-otp (111122223333) -> Status {r.status_code}")
    print(f"Response: {r.json()}")
except Exception as e:
    print(f"POST /send-otp failed: {e}")

try:
    r = requests.post(f"{BASE_URL}/send-otp", json={"aadhaar": "999999999999"})
    print(f"\nPOST /send-otp invalid aadhaar -> Status {r.status_code}")
    print(f"Response: {r.json()}")
except Exception as e:
    print(f"POST /send-otp invalid failed: {e}")
