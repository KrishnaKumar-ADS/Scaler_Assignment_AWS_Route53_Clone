from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.connection import get_db
from app.models.session import Session as DBSession
from app.models.user import User

async def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    session = db.query(DBSession).filter(
        DBSession.session_token == token,
        DBSession.expires_at > datetime.utcnow()
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session"
        )
        
    return session.user
