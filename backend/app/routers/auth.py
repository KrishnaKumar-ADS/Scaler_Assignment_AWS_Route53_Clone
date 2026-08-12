from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse, UserResponse
from app.services.auth import login_user, register_user, logout_user
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=AuthResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    return login_user(db, credentials)

@router.post("/register", response_model=AuthResponse)
def register(credentials: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(db, credentials)

@router.post("/logout")
def logout(authorization: str = Header(None), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        logout_user(db, token)
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
