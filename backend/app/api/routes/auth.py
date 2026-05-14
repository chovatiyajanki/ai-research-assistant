from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth import  UserSignup, Token
from app.db.session import get_db
from app.crud.user import  get_user_by_email, create_user
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

# Signup
@router.post("/signup", response_model=Token)
def signup(user:UserSignup, db: Session = Depends(get_db)):

     # check if user already exists
    existing_user = get_user_by_email(db, user.user_email)

    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="Email already registered"
            )
     # hash password
    hashed = hash_password(user.password)

     # create user in DataBase
    new_user = create_user(
        db, 
        user.user_name, 
        user.user_email, 
        hashed
        )
    # Create JWT Token
    token = create_access_token({
        "sub" : new_user.user_email
        })
    return {
        "access_token" : token, 
        "token_type" : "bearer"
        }

# login
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    db_user = get_user_by_email(db, form_data.username)

    if not db_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid Credentials"
        )
    
    if not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=400, 
            detail="Invalid Credentials"
        )
    
    token = create_access_token({"sub": db_user.user_email})
    return {
        "access_token" : token, 
        "token_type" : "bearer"
        }