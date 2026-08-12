import requests
BASE_URL = "http://127.0.0.1:8000/api"

# Login
res = requests.post(f"{BASE_URL}/auth/login", json={"email": "user1@example.com", "password": "password123"})
token = res.json()["session_token"]
headers = {"Authorization": f"Bearer {token}"}

# Get zones
zones = requests.get(f"{BASE_URL}/hosted-zones", headers=headers).json()["items"]
if not zones:
    # Create zone
    requests.post(f"{BASE_URL}/hosted-zones", json={"name": "testjson.local", "zone_type": "PUBLIC"}, headers=headers)
    zones = requests.get(f"{BASE_URL}/hosted-zones", headers=headers).json()["items"]
    
zone_id = zones[0]["id"]

# Export JSON
print(f"Exporting JSON for zone {zone_id}...")
res = requests.get(f"{BASE_URL}/hosted-zones/{zone_id}/export?format=json", headers=headers)
print("Status:", res.status_code)
print("Response:", res.text)
