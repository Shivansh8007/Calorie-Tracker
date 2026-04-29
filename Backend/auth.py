# -*- coding: utf-8 -*-
"""
Authentication routes — JWT-based login/register with JSON file storage.
"""

import os
import json
import uuid
import time
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
import bcrypt
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr

# ═══════════════════════════════════════════════════════════════════
#  CONFIG
# ═══════════════════════════════════════════════════════════════════
SECRET_KEY = "nutrition-tracker-super-secret-key-change-in-production"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 72

USERS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users.json")

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ═══════════════════════════════════════════════════════════════════
#  MODELS
# ═══════════════════════════════════════════════════════════════════
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    calorie_goal: int = 2000

# ═══════════════════════════════════════════════════════════════════
#  HELPERS
# ═══════════════════════════════════════════════════════════════════
def _load_users() -> dict:
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def _save_users(users: dict):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def _verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def _create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def _decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(authorization: str = Header(None)) -> dict:
    """Dependency to extract and verify current user from JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    user_id = _decode_token(token)
    
    users = _load_users()
    if user_id not in users:
        raise HTTPException(status_code=401, detail="User not found")
    
    user = users[user_id]
    return {"id": user_id, **user}

# ═══════════════════════════════════════════════════════════════════
#  ROUTES
# ═══════════════════════════════════════════════════════════════════
@router.post("/register")
async def register(req: RegisterRequest):
    users = _load_users()
    
    # Check for duplicate email
    for uid, u in users.items():
        if u["email"].lower() == req.email.lower():
            raise HTTPException(status_code=400, detail="Email already registered")
    
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    user_id = str(uuid.uuid4())
    users[user_id] = {
        "name": req.name,
        "email": req.email.lower(),
        "password_hash": _hash_password(req.password),
        "calorie_goal": 2000,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _save_users(users)
    
    token = _create_token(user_id)
    return {
        "token": token,
        "user": {"id": user_id, "name": req.name, "email": req.email.lower(), "calorie_goal": 2000},
    }

@router.post("/login")
async def login(req: LoginRequest):
    users = _load_users()
    
    for uid, u in users.items():
        if u["email"].lower() == req.email.lower():
            if _verify_password(req.password, u["password_hash"]):
                token = _create_token(uid)
                return {
                    "token": token,
                    "user": {"id": uid, "name": u["name"], "email": u["email"], "calorie_goal": u.get("calorie_goal", 2000)},
                }
            else:
                raise HTTPException(status_code=401, detail="Invalid password")
    
    raise HTTPException(status_code=401, detail="Email not found")

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "calorie_goal": current_user.get("calorie_goal", 2000),
    }
