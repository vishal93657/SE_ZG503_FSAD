from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    role = Column(String, default="Student")

class Equipment(Base):
    __tablename__ = 'equipment'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    condition = Column(String)
    quantity = Column(Integer)
    available_quantity = Column(Integer, nullable=True)

class LoanRequest(Base):
    __tablename__ = 'loan_requests'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    equipment_id = Column(Integer, ForeignKey('equipment.id'))
    status = Column(String, default="pending")
    borrow_date = Column(DateTime)
    return_date = Column(DateTime)
    quantity = Column(Integer) 

    user = relationship("User", back_populates="loan_requests")
    equipment = relationship("Equipment", back_populates="loan_requests")

User.loan_requests = relationship("LoanRequest", back_populates="user")
Equipment.loan_requests = relationship("LoanRequest", back_populates="equipment")
