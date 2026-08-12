import requests
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:8000"

print("--- Testing Auth ---")
response = requests.post(f"{API_URL}/api/auth/login", json={"email": "demo@example.com", "password": "demo1234"})
if response.status_code == 200:
    print("[OK] Login successful")
    token = response.json().get("session_token")
else:
    print("[ERROR] Login failed:", response.text)
    exit(1)

print("\n--- Testing Hosted Zones ---")
response = requests.get(f"{API_URL}/api/hosted-zones", headers={"Authorization": f"Bearer {token}"})
if response.status_code == 200:
    zones = response.json().get("items", [])
    print(f"[OK] Get Hosted Zones successful, retrieved {len(zones)} zones")
    
    print("\n--- Testing DNS Records ---")
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

print("\n--- Testing Analytics ---")
response = requests.get(f"{API_URL}/api/analytics/dashboard-stats", headers={"Authorization": f"Bearer {token}"})
if response.status_code == 200:
    stats = response.json()
    print("[OK] Get Dashboard Stats successful")
    print(f"  - Total Zones: {stats['total_hosted_zones']} (Public: {stats['public_zones']}, Private: {stats['private_zones']})")
    print(f"  - Total DNS Records: {stats['total_dns_records']}")
    print(f"  - Recent Activity: {stats['recent_activity_count']} events")
else:
    print("[ERROR] Get Dashboard Stats failed:", response.text)

response = requests.get(f"{API_URL}/api/analytics/audit-logs?limit=3", headers={"Authorization": f"Bearer {token}"})
if response.status_code == 200:
    logs = response.json().get("items", [])
    print(f"[OK] Get Audit Logs successful, retrieved {len(logs)} most recent logs:")
    for log in logs:
        print(f"  - {log['action']} on {log['resource_type']} ({log['created_at']})")
else:
    print("[ERROR] Get Audit Logs failed:", response.text)

