from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    UserSignup,
    Token,
)
from app.db.session import get_db
from app.crud.user import  get_user_by_email, create_user
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    hash_password,
    hash_reset_token,
    verify_password,
)
from app.models.password_reset import PasswordResetToken

router = APIRouter()
PASSWORD_RESET_EXPIRE_MINUTES = 30

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


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, payload.email)
    response = {
        "message": "If that email exists, a password reset link has been generated."
    }

    if not user:
        return response

    token = create_password_reset_token()
    token_hash = hash_reset_token(token)
    expires_at = datetime.utcnow() + timedelta(minutes=PASSWORD_RESET_EXPIRE_MINUTES)

    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.user_id,
        PasswordResetToken.used_at.is_(None),
    ).delete()

    db.add(PasswordResetToken(
        user_id=user.user_id,
        token_hash=token_hash,
        expires_at=expires_at,
    ))
    db.commit()

    # Development flow: return the link directly until an email provider is configured.
    response["reset_token"] = token
    response["reset_url"] = f"/reset-password?token={token}"
    return response


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    token_hash = hash_reset_token(payload.token)
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used_at.is_(None),
    ).first()

    if not reset_token or reset_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Password reset link is invalid or expired"
        )

    reset_token.user.hashed_password = hash_password(payload.password)
    reset_token.used_at = datetime.utcnow()
    db.commit()

    return {"message": "Password reset successfully"}
