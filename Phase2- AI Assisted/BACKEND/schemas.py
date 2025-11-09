from pydantic import BaseModel,EmailStr
from datetime import datetime
from typing import Optional, Literal


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

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    quantity: Optional[int] = None

class LoanRequestCreate(BaseModel):
    user_id: int
    return_date: datetime
    quantity: int

class LoanRequest(LoanRequestCreate):
    id: int
    borrow_date: datetime
    status: str
    equipment_id: int

    class Config:
        orm_mode = True

class LoanRequestStatusUpdate(BaseModel):
    status: Literal["accepted","rejected", "returned"]
