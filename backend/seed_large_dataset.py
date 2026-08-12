import sys
import os
import random
sys.path.append(os.path.dirname(__file__))

from sqlalchemy.orm import Session
from app.database.connection import engine, Base
from passlib.context import CryptContext
from datetime import datetime, timedelta

from app.models.user import User
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.models.audit_log import AuditLog

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

domains_list = [
    ("example.com", "PUBLIC", "Main production website and primary customer portal"),
    ("cloudapp.io", "PUBLIC", "SaaS web application & user portal"),
    ("api-gateway.net", "PUBLIC", "REST and GraphQL API Gateway endpoints"),
    ("auth-service.org", "PUBLIC", "OAuth2 & OIDC Identity Provider"),
    ("metrics-dashboard.co", "PUBLIC", "Internal monitoring & Grafana dashboards"),
    ("cdn-origin.com", "PUBLIC", "Static asset origin and cloud storage distribution"),
    ("k8s-ingress.internal", "PRIVATE", "Kubernetes cluster ingress controller routing"),
    ("payments-v2.net", "PUBLIC", "PCI-DSS compliant payment processing gateway"),
    ("db-cluster.local", "PRIVATE", "Primary PostgreSQL and Redis database nodes"),
    ("analytics-engine.io", "PUBLIC", "Real-time data pipeline and analytics ingest"),
    ("search-index.org", "PUBLIC", "OpenSearch cluster & indexing service"),
    ("webhooks.co", "PUBLIC", "Third-party developer webhook delivery pipeline"),
    ("storage-s3-proxy.com", "PUBLIC", "High-throughput object storage proxy"),
    ("user-portal.dev", "PUBLIC", "Developer sandbox & documentation portal"),
    ("billing-stripe.net", "PUBLIC", "Subscription management & automated billing"),
    ("messaging-kafka.internal", "PRIVATE", "Apache Kafka event bus broker cluster"),
    ("identity-provider.org", "PUBLIC", "Enterprise Single Sign-On (SSO) service"),
    ("monitoring-prometheus.co", "PUBLIC", "Infrastructure metrics scraper & alertmanager"),
    ("logging-elasticsearch.com", "PUBLIC", "Centralized log collection and analysis"),
    ("feature-flags.dev", "PUBLIC", "Real-time feature flag evaluation service"),
    ("email-postfix.net", "PUBLIC", "Outbound transactional email SMTP cluster"),
    ("cache-redis.internal", "PRIVATE", "In-memory Redis cache cluster"),
    ("ml-model-server.io", "PUBLIC", "AI/ML inference endpoint server"),
    ("support-tickets.co", "PUBLIC", "Customer service portal and ticketing engine"),
    ("static-assets.cdn.com", "PUBLIC", "Global Edge CDN static asset distribution"),
    ("dns-secondary.net", "PUBLIC", "Secondary DNS redundant name server cluster"),
    ("vpn-gateway.internal", "PRIVATE", "WireGuard corporate VPN access gateway"),
    ("staging-environment.dev", "PUBLIC", "Pre-production staging environment"),
    ("sandbox-testing.io", "PUBLIC", "QA automated test runner environment"),
    ("disaster-recovery.org", "PUBLIC", "Failover disaster recovery infrastructure")
]

record_templates = [
    ("@", "A", "192.0.2.{i}", 300),
    ("www", "CNAME", "{domain}", 3600),
    ("api", "A", "198.51.100.{i}", 300),
    ("api-v2", "AAAA", "2001:db8::{i}", 300),
    ("mail", "MX", "mail.{domain}", 86400),
    ("@", "TXT", "v=spf1 include:_spf.{domain} ~all", 3600),
    ("@", "NS", "ns1.route53-dns.com", 172800),
    ("@", "NS", "ns2.route53-dns.com", 172800),
    ("dev", "A", "10.0.{i}.15", 300),
    ("stage", "CNAME", "staging.{domain}", 600),
]

def seed_30_domains():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)

    with Session(engine) as db:
        demo_user = db.query(User).filter(User.email == "demo@example.com").first()
        if not demo_user:
            print("Creating Demo User demo@example.com...")
            demo_user = User(
                email="demo@example.com",
                password_hash=get_password_hash("demo1234")
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        else:
            print("Found existing demo user, expanding dataset...")

        now = datetime.utcnow()
        total_records_created = 0

        for idx, (domain_name, zone_type, desc) in enumerate(domains_list, start=1):
            zone = db.query(HostedZone).filter(HostedZone.name == domain_name, HostedZone.user_id == demo_user.id).first()
            if not zone:
                zone = HostedZone(
                    user_id=demo_user.id,
                    name=domain_name,
                    zone_type=zone_type,
                    status="ACTIVE",
                    description=desc,
                    created_at=now - timedelta(days=random.randint(1, 60))
                )
                db.add(zone)
                db.commit()
                db.refresh(zone)

                # Audit Log
                db.add(AuditLog(
                    user_id=demo_user.id,
                    action="CREATE_HOSTED_ZONE",
                    resource_type="HOSTED_ZONE",
                    resource_id=zone.id,
                    description=f"Created {zone_type} zone for {domain_name}",
                    source="SYSTEM",
                    created_at=now - timedelta(days=random.randint(1, 60))
                ))
                db.commit()

            # Create DNS records for this zone
            records = []
            for sub, rtype, val_tmpl, ttl in record_templates:
                rec_name = domain_name if sub == "@" else f"{sub}.{domain_name}"
                val = val_tmpl.format(i=idx, domain=domain_name)
                
                dup = db.query(DNSRecord).filter(
                    DNSRecord.hosted_zone_id == zone.id,
                    DNSRecord.name == rec_name,
                    DNSRecord.record_type == rtype
                ).first()

                if not dup:
                    rec = DNSRecord(
                        hosted_zone_id=zone.id,
                        name=rec_name,
                        record_type=rtype,
                        value=val,
                        ttl=ttl,
                        created_at=now - timedelta(days=random.randint(1, 30))
                    )
                    db.add(rec)
                    records.append(rec)

            db.commit()
            total_records_created += len(records)

            # Update record count on Hosted Zone
            actual_count = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone.id).count()
            zone.record_count = actual_count
            db.commit()

        # Final Verification
        all_zones = db.query(HostedZone).filter(HostedZone.user_id == demo_user.id).all()
        zone_ids = [z.id for z in all_zones]
        all_records_count = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id.in_(zone_ids)).count()

        print(f"SUCCESSFULLY SEEDED DATASET!")
        print(f"User: demo@example.com (Password: demo1234)")
        print(f"Total Hosted Zones: {len(all_zones)}")
        print(f"Total DNS Records: {all_records_count}")

if __name__ == "__main__":
    seed_30_domains()
