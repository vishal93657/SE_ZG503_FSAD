from pydantic import BaseModel,EmailStr, validator
from datetime import datetime
from typing import Optional, Literal


class UserBase(BaseModel):
    """Base Pydantic schema for user properties."""
    username: str
    email: EmailStr
    role: Optional[str] = "student"

class UserCreate(UserBase):
    """Schema for user creation, requiring a password."""
    password: str
    @validator('password')
    def password_length(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long.')
        return v

class UserInDB(UserBase):
    """Schema for internal user representation with hashed password (not used in API response)."""
    id: int
    password_hash: str

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    """Schema for user login credentials."""
    username: str
    password: str

class UserProfile(UserBase):
    """Schema for user profile retrieval, including ID and role."""
    id: int
    role: str

class EquipmentCreate(BaseModel):
    """Schema for creating a new equipment item."""
    name: str
    category: str
    condition: str
    quantity: int

class Equipment(EquipmentCreate):
    """Schema for equipment retrieval, including ID and available quantity."""
    id: int
    available_quantity: int

    class Config:
        orm_mode = True

class EquipmentUpdate(BaseModel):
    """Schema for updating an equipment item, making all fields optional."""
    name: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    quantity: Optional[int] = None

class LoanRequestCreate(BaseModel):
    """Schema for creating a new loan request (sent by the borrower)."""
    user_id: int
    return_date: datetime
    quantity: int

class LoanRequest(LoanRequestCreate):
    """Schema for loan request retrieval, including all generated fields."""
    id: int
    borrow_date: datetime
    status: str
    equipment_id: int

    class Config:
        orm_mode = True

class LoanRequestStatusUpdate(BaseModel):
    """Schema for updating the status of a loan request."""
    status: Literal["accepted","rejected", "returned"]
