import requests
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:8000"

print("--- Testing Phase 3: Auth ---")
response = requests.post(f"{API_URL}/api/auth/login", json={"email": "demo@example.com", "password": "demo1234"})
if response.status_code == 200:
    print("[OK] Login successful")
    token = response.json().get("session_token")
else:
    print("[ERROR] Login failed:", response.text)
    exit(1)

print("\n--- Testing Phase 4: Hosted Zones ---")
response = requests.get(f"{API_URL}/api/hosted-zones", headers={"Authorization": f"Bearer {token}"})
if response.status_code == 200:
    zones = response.json().get("items", [])
    print(f"[OK] Get Hosted Zones successful, retrieved {len(zones)} zones")
    
    print("\n--- Testing Phase 5: DNS Records ---")
    if zones:
        first_zone_id = zones[0]['id']
        response = requests.get(f"{API_URL}/api/hosted-zones/{first_zone_id}/records", headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            records = response.json()
            print(f"[OK] Get DNS Records for Zone {first_zone_id} successful, retrieved {len(records)} records:")
            for r in records:
                print(f"  - {r['name']} ({r['record_type']}): {r['value']} (TTL: {r['ttl']})")
        else:
            print("[ERROR] Get DNS Records failed:", response.text)
else:
    print("[ERROR] Get Hosted Zones failed:", response.text)
