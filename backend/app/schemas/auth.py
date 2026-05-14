from pydantic import BaseModel, EmailStr, Field

class  UserSignup(BaseModel):
    user_name: str
    user_email: EmailStr
    password : str = Field(..., min_length=6, max_length=72)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str