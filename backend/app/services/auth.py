from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from passlib.context import CryptContext
from datetime import datetime, timedelta
import uuid

from app.models.user import User
from app.models.session import Session as DBSession
from app.models.audit_log import AuditLog
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def login_user(db: Session, credentials: LoginRequest) -> AuthResponse:
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate new session token
    token = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(hours=24)
    
    new_session = DBSession(
        user_id=user.id,
        session_token=token,
        expires_at=expires
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return AuthResponse(
        session_token=token,
        user=user
    )

def register_user(db: Session, credentials: RegisterRequest) -> AuthResponse:
    existing = db.query(User).filter(User.email == credentials.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    hashed_pw = pwd_context.hash(credentials.password)
    user = User(
        email=credentials.email,
        password_hash=hashed_pw
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log registration event
    db.add(AuditLog(
        user_id=user.id,
        action="SIGN_UP",
        resource_type="USER",
        resource_id=user.id,
        description=f"User signed up with {user.email}",
        source="UI"
    ))
    db.commit()

    # Log user in directly
    token = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(hours=24)
    new_session = DBSession(
        user_id=user.id,
        session_token=token,
        expires_at=expires
    )
    db.add(new_session)
    db.commit()

    return AuthResponse(
        session_token=token,
        user=user
    )

def logout_user(db: Session, token: str):
    session = db.query(DBSession).filter(DBSession.session_token == token).first()
    if session:
        db.delete(session)
        db.commit()
