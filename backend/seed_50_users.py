import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from sqlalchemy.orm import Session
from app.database.connection import engine, Base
from app.models.user import User
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.models.audit_log import AuditLog
from app.database.seed import get_password_hash
from datetime import datetime, timedelta

def generate_50_users():
    print("Generating 50 users and dummy data...")
    with Session(engine) as db:
        # Generate exactly 50 users
        password_hash = get_password_hash("password123")
        now = datetime.utcnow()
        
        for i in range(1, 51):
            email = f"user{i}@example.com"
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(email=email, password_hash=password_hash)
                db.add(user)
                db.commit()
                db.refresh(user)
            
            # For each user, create 3 hosted zones
            for j in range(1, 4):
                zone_name = f"app{j}-user{i}.com"
                zone = db.query(HostedZone).filter(HostedZone.name == zone_name, HostedZone.user_id == user.id).first()
                if not zone:
                    zone = HostedZone(
                        user_id=user.id,
                        name=zone_name,
                        zone_type="PUBLIC",
                        status="ACTIVE",
                        description=f"Production Zone {j} for user {i}"
                    )
                    db.add(zone)
                    db.commit()
                    db.refresh(zone)
                    
                    # Log
                    db.add(AuditLog(
                        user_id=user.id, action="CREATE_HOSTED_ZONE",
                        resource_type="HOSTED_ZONE", resource_id=zone.id,
                        description=f"Created {zone.name}", source="SYSTEM"
                    ))
                    
                    # Create 5 DNS records for each zone
                    records = [
                        DNSRecord(hosted_zone_id=zone.id, name=zone.name, record_type="A", value=f"192.168.{i}.{j}"),
                        DNSRecord(hosted_zone_id=zone.id, name=f"www.{zone.name}", record_type="CNAME", value=zone.name),
                        DNSRecord(hosted_zone_id=zone.id, name=f"api.{zone.name}", record_type="A", value=f"10.0.{i}.{j}"),
                        DNSRecord(hosted_zone_id=zone.id, name=f"mail.{zone.name}", record_type="MX", value=f"mail.{zone.name}"),
                        DNSRecord(hosted_zone_id=zone.id, name=zone.name, record_type="TXT", value=f"user={i}")
                    ]
                    for r in records:
                        db.add(r)
                    zone.record_count = 5
                    db.commit()
            
            if i % 10 == 0:
                print(f"Generated {i}/50 users...")
                
        print("Successfully generated 50 users and their Route53 data!")

if __name__ == "__main__":
    generate_50_users()
