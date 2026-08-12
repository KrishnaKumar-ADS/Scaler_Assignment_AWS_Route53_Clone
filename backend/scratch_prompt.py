import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:8000"

print("Logging in to get token...")
resp = requests.post(f"{API_URL}/api/auth/login", json={"email": "user1@example.com", "password": "password123"})
if resp.status_code != 200:
    print("Login failed")
    sys.exit(1)

token = resp.json()["session_token"]

def chat(msg):
    print(f"\nUser: {msg}")
    r = requests.post(
        f"{API_URL}/api/chat",
        headers={"Authorization": f"Bearer {token}"},
        json={"messages": [{"role": "user", "content": msg}]}
    )
    if r.status_code == 200:
        print(f"AI: {r.json()['response']}")
    else:
        print(f"ERROR: {r.status_code} - {r.text}")

# Prompt 1: Greeting
chat("Hello there!")

# Prompt 2: Out of bounds
chat("How do I make a chocolate cake?")

# Prompt 3: Valid query
chat("How many DNS records are in my app1-user1.com zone, and what are their IP addresses?")
