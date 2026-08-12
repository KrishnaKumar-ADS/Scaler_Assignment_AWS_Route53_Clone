import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from sqlalchemy.orm import Session
from app.database.connection import engine, Base
from passlib.context import CryptContext
from datetime import datetime, timedelta

from app.models.user import User
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.models.audit_log import AuditLog
from app.models.session import Session as DBSession

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as db:
        if db.query(User).first():
            print("Database already seeded!")
            return

        print("Seeding Demo User...")
        demo_user = User(
            email="demo@example.com",
            password_hash=get_password_hash("demo1234")
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        print("Seeding Hosted Zones & DNS Records...")
        zones = [
            {"name": "example.com", "type": "PUBLIC", "status": "ACTIVE", "desc": "Production website"},
            {"name": "mysite.com", "type": "PUBLIC", "status": "ACTIVE", "desc": "Personal blog"},
            {"name": "internal.local", "type": "PRIVATE", "status": "ACTIVE", "desc": "Intranet"},
            {"name": "demo.org", "type": "PUBLIC", "status": "INACTIVE", "desc": "Legacy demo site"},
            {"name": "cloudapp.io", "type": "PUBLIC", "status": "ACTIVE", "desc": "SaaS application"},
            {"name": "dev-internal.local", "type": "PRIVATE", "status": "INACTIVE", "desc": "Dev environment"}
        ]
        
        now = datetime.utcnow()

        for z in zones:
            zone = HostedZone(
                user_id=demo_user.id,
                name=z["name"],
                zone_type=z["type"],
                status=z["status"],
                description=z["desc"]
            )
            db.add(zone)
            db.commit()
            db.refresh(zone)

            # Audit log for zone creation
            log = AuditLog(
                user_id=demo_user.id,
                action="CREATE_HOSTED_ZONE",
                resource_type="HOSTED_ZONE",
                resource_id=zone.id,
                description=f"Created {zone.name}",
                source="SYSTEM",
                created_at=now - timedelta(days=2)
            )
            db.add(log)

            # Add some DNS records
            records = [
                DNSRecord(hosted_zone_id=zone.id, name=zone.name, record_type="A", value="192.168.1.10"),
                DNSRecord(hosted_zone_id=zone.id, name=f"www.{zone.name}", record_type="CNAME", value=zone.name),
                DNSRecord(hosted_zone_id=zone.id, name=f"mail.{zone.name}", record_type="MX", value=f"mail.{zone.name}"),
                DNSRecord(hosted_zone_id=zone.id, name=zone.name, record_type="TXT", value="verification=12345")
            ]
            
            for r in records:
                db.add(r)
            
            zone.record_count = len(records)
            db.commit()

        print("Seeding complete!")

if __name__ == "__main__":
    seed_db()
