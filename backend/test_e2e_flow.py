import requests
import json
import time

BASE_URL = "http://127.0.0.1:8001/api"
print("\n--- Route53 Clone End-to-End Test ---")

# 1. Login as User 1
print("1. Logging in as user1@example.com...")
res = requests.post(f"{BASE_URL}/auth/login", json={"email": "user1@example.com", "password": "password123"})
assert res.status_code == 200, f"Login failed: {res.text}"
token = res.json()["session_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"[SUCCESS] Login successful! Token: {token[:10]}...")

# 2. Create Hosted Zone
print("\n2. Creating Hosted Zone 'e2e.test.local'...")
res = requests.post(f"{BASE_URL}/hosted-zones", json={"name": "e2e.test.local", "zone_type": "PUBLIC"}, headers=headers)
assert res.status_code == 200, f"Zone creation failed: {res.text}"
zone_id = res.json()["id"]
print(f"[SUCCESS] Zone created! ID: {zone_id}")

# 3. Create DNS Record
print(f"\n3. Creating DNS Record 'api' for Zone {zone_id}...")
res = requests.post(f"{BASE_URL}/hosted-zones/{zone_id}/records", json={
    "name": "api", "record_type": "A", "value": "10.0.0.1", "ttl": 300
}, headers=headers)
assert res.status_code == 200, f"Record creation failed: {res.text}"
record_id = res.json()["id"]
print(f"[SUCCESS] Record created! ID: {record_id}")

# 4. Check Audit Logs
print("\n4. Checking Audit Logs for actions...")
res = requests.get(f"{BASE_URL}/analytics/audit-logs?limit=10", headers=headers)
assert res.status_code == 200, f"Audit logs failed: {res.text}"
logs = res.json()["items"]
actions = [log["action"] for log in logs]
print(f"[SUCCESS] Logs retrieved! Recent actions: {actions[:3]}")
assert "CREATE_HOSTED_ZONE" in actions, "Zone creation log missing"
assert "CREATE_DNS_RECORD" in actions, "Record creation log missing"

# 5. Export Zone (Bonus Feature)
print(f"\n5. Exporting Zone {zone_id} as BIND format...")
res = requests.get(f"{BASE_URL}/hosted-zones/{zone_id}/export?format=bind", headers=headers)
assert res.status_code == 200, f"Export failed: {res.text}"
print(f"[SUCCESS] Export successful!\n-- BIND PREVIEW --\n{res.text[:100]}...\n------------------")

# 6. Chat with AI Assistant
print("\n6. Chatting with AI Assistant...")
chat_payload = {
    "messages": [
        {"role": "user", "content": "I just created a zone called e2e.test.local. What are my hosted zones?"}
    ]
}
res = requests.post(f"{BASE_URL}/chat", json=chat_payload, headers=headers)
assert res.status_code == 200, f"Chat failed: {res.text}"
ai_response = res.json()["response"]
print(f"[SUCCESS] AI Response: {ai_response}")

# 7. Bulk Delete Records (Bonus Feature)
print(f"\n7. Testing Bulk Delete Records...")
res = requests.post(f"{BASE_URL}/hosted-zones/{zone_id}/records/bulk-delete", json={"ids": [record_id]}, headers=headers)
assert res.status_code == 200, f"Bulk delete failed: {res.text}"
print(f"✅ Bulk delete successful: {res.json()['message']}")

# 8. Clean up (Delete Zone)
print(f"\n8. Cleaning up Zone {zone_id}...")
res = requests.delete(f"{BASE_URL}/hosted-zones/{zone_id}", headers=headers)
assert res.status_code == 200, f"Zone delete failed: {res.text}"
print(f"[SUCCESS] Cleanup successful!")

print("\n[ALL TESTS PASSED] ALL E2E TESTS PASSED SUCCESSFULLY! [ALL TESTS PASSED]")
