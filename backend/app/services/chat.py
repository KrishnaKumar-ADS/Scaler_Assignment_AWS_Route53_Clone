import os
import json
from openai import OpenAI
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

SYSTEM_PROMPT = """Role: You are a strict, specialized technical assistant. Your primary domain of expertise is AWS Route 53 and this management console.

Operational Rules:
Strict Scope: You may only answer questions that are directly related to this project, AWS Route 53, or the user's own database data provided below.
Greeting Exception: You are permitted to acknowledge basic conversational greetings (e.g., "hi", "hello", "good morning"). Respond with exactly: "Hello! how can I assist you?"
Hard Boundary: If a user asks a question, requests a task, or attempts to engage in a topic outside of greetings, AWS Route 53, or their specific data, you must immediately halt execution and refuse the request.
Refusal Protocol: Do not apologize profusely, do not explain why you cannot answer, and do not attempt to pivot. If a query is out of bounds, you must reply with exactly: "Sorry, I cannot answer that."
No Assumptions: If a user's prompt is ambiguous and you cannot definitively link it to the project, AWS Route 53, or their data, default to the Refusal Protocol.

User Data Context (READ-ONLY):
Below is the current state of the database for the user you are talking to. You may use this data to answer their questions about their zones and records. 
Never discuss or invent data for other users.
"""

def generate_user_context(db: Session, user_id: int) -> str:
    zones = db.query(HostedZone).filter(HostedZone.user_id == user_id).all()
    context = {"hosted_zones": []}
    
    for zone in zones:
        zone_data = {
            "name": zone.name,
            "type": zone.zone_type,
            "status": zone.status,
            "record_count": zone.record_count,
            "records": []
        }
        records = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone.id).all()
        for rec in records:
            zone_data["records"].append({
                "name": rec.name,
                "type": rec.record_type,
                "value": rec.value,
                "ttl": rec.ttl
            })
        context["hosted_zones"].append(zone_data)
        
    return json.dumps(context, indent=2)

def chat_with_ai(db: Session, user_id: int, user_messages: list) -> str:
    user_context = generate_user_context(db, user_id)
    
    final_system_prompt = SYSTEM_PROMPT + "\n\nUser Database Data:\n" + user_context
    
    messages = [{"role": "system", "content": final_system_prompt}]
    
    for msg in user_messages:
        messages.append({"role": msg.role, "content": msg.content})
        
    completion = client.chat.completions.create(
        model="openrouter/free",
        messages=messages,
        extra_headers={
            "HTTP-Referer": "https://localhost:3000",
            "X-Title": "Route53 Clone",
        }
    )
    
    return completion.choices[0].message.content
