from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash Password
def hash_password(password: str) -> str:
    if len(password) > 72:
        raise ValueError("Password too long (max 72 chaaracters)")
    return pwd_context.hash(password)

# verify password 
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password,hashed_password) 

# Create JWT Token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire =  datetime.utcnow() +  timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode,settings.SECRET_KEY, algorithm=settings.ALGORITHM)