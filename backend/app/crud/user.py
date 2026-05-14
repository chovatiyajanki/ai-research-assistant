from sqlalchemy.orm import Session
from app.models.user import User

def get_user_by_email(db: Session, user_email: str):
    return  db.query(User).filter(User.user_email == user_email).first()

def create_user(db: Session, user_name: str,  user_email: str, hashed_password: str):
    user = User(user_name = user_name,user_email = user_email,  hashed_password = hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user