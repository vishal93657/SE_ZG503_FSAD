from pydantic import BaseModel,EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Optional[str] = "student"

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    password_hash: str

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str

class UserProfile(UserBase):
    id: int
    role: str

class EquipmentCreate(BaseModel):
    name: str
    category: str
    condition: str
    quantity: int

class Equipment(EquipmentCreate):
    id: int
    available_quantity: int

    class Config:
        orm_mode = True

class LoanRequestCreate(BaseModel):
    user_id: int
    return_date: datetime

class LoanRequest(LoanRequestCreate):
    id: int
    borrow_date: datetime

    class Config:
        orm_mode = True
