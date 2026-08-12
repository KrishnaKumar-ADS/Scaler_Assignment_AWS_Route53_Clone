from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from passlib.context import CryptContext
from datetime import datetime, timedelta
import uuid

from app.models.user import User
from app.models.session import Session as DBSession
from app.schemas.auth import LoginRequest, AuthResponse

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

def logout_user(db: Session, token: str):
    session = db.query(DBSession).filter(DBSession.session_token == token).first()
    if session:
        db.delete(session)
        db.commit()
