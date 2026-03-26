from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from common.database import get_auth_db
from common.security import hash_password, verify_password, create_access_token
from services.auth_service import models, schemas

router = APIRouter()

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_auth_db)):
    # 1. Check if user already exists
    user_exists = db.query(models.User).filter(
        (models.User.email == user_in.email) | (models.User.username == user_in.username)
    ).first()
    
    if user_exists:
        raise HTTPException(
            status_code=400,
            detail="User with this email or username already exists"
        )

    # 2. Hash password and save
    new_user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_auth_db)):
    # OAuth2PasswordRequestForm uses 'username' field for the login identifier (can be email)
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Create JWT (include sub and role for RBAC later)
    access_token = create_access_token(
        data={"sub": user.username,"task_id": user.id, "role": user.role}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}