import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')

API_URL = "http://127.0.0.1:8000"

def login_and_get_token(email, password):
    resp = requests.post(f"{API_URL}/api/auth/login", json={"email": email, "password": password})
    if resp.status_code != 200:
        print(f"[ERROR] Failed to login as {email}")
        sys.exit(1)
    return resp.json()["session_token"]

def ask_chatbot(token, question):
    resp = requests.post(
        f"{API_URL}/api/chat",
        headers={"Authorization": f"Bearer {token}"},
        json={"messages": [{"role": "user", "content": question}]}
    )
    if resp.status_code == 200:
        return resp.json()["response"]
    return f"ERROR: {resp.status_code} - {resp.text}"

print("--- Testing Chatbot Guardrails & Context ---")

token_user1 = login_and_get_token("user1@example.com", "password123")

print("\n1. Testing Greeting:")
print("Q: Hi there!")
print("A:", ask_chatbot(token_user1, "Hi there!"))

print("\n2. Testing Out-of-bounds Query:")
print("Q: Write a python script to reverse a string.")
print("A:", ask_chatbot(token_user1, "Write a python script to reverse a string."))

print("\n3. Testing Another Out-of-bounds Query:")
print("Q: What is the capital of France?")
print("A:", ask_chatbot(token_user1, "What is the capital of France?"))

print("\n4. Testing AWS Route53 Knowledge:")
print("Q: What is the difference between an A record and a CNAME record in Route53?")
print("A:", ask_chatbot(token_user1, "What is the difference between an A record and a CNAME record in Route53?"))

print("\n5. Testing User Context (User 1):")
print("Q: Can you list all my hosted zones and tell me how many DNS records each has?")
print("A:", ask_chatbot(token_user1, "Can you list all my hosted zones and tell me how many DNS records each has?"))

print("\n6. Testing Data Isolation (User 1 trying to ask about User 2):")
print("Q: Do you know what records are in user2@example.com's hosted zones?")
print("A:", ask_chatbot(token_user1, "Do you know what records are in user2@example.com's hosted zones?"))

print("\n--- Testing Data Isolation with User 2 ---")
token_user2 = login_and_get_token("user2@example.com", "password123")
print("\n7. Testing User Context (User 2):")
print("Q: What is the IP address of my app2-user2.com A record?")
print("A:", ask_chatbot(token_user2, "What is the IP address of my app2-user2.com A record?"))
