from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import uuid

from database import get_db
from models import db
from models.schemas import User as UserSchema, UserCreate, Token
from utils.auth import verify_password, get_password_hash, create_access_token, decode_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# --- DEPENDENCIES ---

async def get_current_user(token: str = Depends(oauth2_scheme), db_session: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    user = db_session.query(db.User).filter(db.User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user

# --- ENDPOINTS ---

@router.post("/register", response_model=UserSchema)
async def register(user: UserCreate, db_session: Session = Depends(get_db)):
    # Check if exists
    db_user = db_session.query(db.User).filter(db.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    
    new_user = db.User(
        email=user.email, 
        hashed_password=hashed_password,
        full_name=user.full_name,
        tier=user.tier
    )
    
    db_session.add(new_user)
    db_session.commit()
    db_session.refresh(new_user)
    
    # Map to Pydantic schema manually or let FastAPI handle it if Config is set
    return new_user

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db_session: Session = Depends(get_db)):
    user = db_session.query(db.User).filter(db.User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: db.User = Depends(get_current_user)):
    return current_user

# Admin endpoint (useful for debugging/manual updates)
@router.post("/upgrade/{email}")
async def upgrade_user(email: str, db_session: Session = Depends(get_db)):
    user = db_session.query(db.User).filter(db.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.tier = "pro"
    db_session.commit()
    return {"status": "success", "message": f"User {email} upgraded to PRO"}
