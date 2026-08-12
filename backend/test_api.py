import requests

API_URL = "http://127.0.0.1:8000"

print("--- Testing Phase 3: Auth ---")
# 1. Login
response = requests.post(f"{API_URL}/api/auth/login", json={
    "email": "demo@example.com",
    "password": "demo1234"
})
if response.status_code == 200:
    print("✅ Login successful")
    token = response.json().get("session_token")
else:
    print("❌ Login failed:", response.text)
    exit(1)

# 2. Get /me
response = requests.get(f"{API_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
if response.status_code == 200:
    print("✅ Get /me successful, User:", response.json().get("email"))
else:
    print("❌ Get /me failed:", response.text)

print("\n--- Testing Phase 4: Hosted Zones ---")
# 3. Get Hosted Zones
response = requests.get(f"{API_URL}/api/hosted-zones", headers={"Authorization": f"Bearer {token}"})
if response.status_code == 200:
    zones = response.json().get("items", [])
    print(f"✅ Get Hosted Zones successful, retrieved {len(zones)} zones")
    for z in zones[:3]:
        print(f"  - {z['name']} ({z['zone_type']}) - Status: {z['status']}")
    if len(zones) > 3:
        print(f"  - ... and {len(zones) - 3} more")
else:
    print("❌ Get Hosted Zones failed:", response.text)
