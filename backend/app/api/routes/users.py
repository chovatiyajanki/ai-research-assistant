from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, require_admin
from app.models.user import User

router = APIRouter()

# User route    
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "email" : current_user.user_email,
        "id" : current_user.user_id
    }

# Admin route
@router.get("/admin")
def admin_only(user: User = Depends(require_admin)):
    return {"message" : "Welcome Admin"}