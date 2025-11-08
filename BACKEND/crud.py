from sqlalchemy.orm import Session
import models, schemas, utils
from datetime import datetime
from fastapi import HTTPException


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = utils.hash_password(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def verify_user_password(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if user and utils.verify_password(password, user.hashed_password):
        return user
    return None

def create_equipment(db: Session, equipment: schemas.EquipmentCreate):
    db_equipment = models.Equipment(**equipment.dict())
    db_equipment.available_quantity = db_equipment.quantity
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

def get_equipment(db: Session):
    return db.query(models.Equipment).filter(models.Equipment.available_quantity > 0).all()

def borrow_equipment(db: Session, equipment_id: int, user_id: int, return_date: datetime):
    db_equipment = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not db_equipment or db_equipment.available_quantity <= 0:
        raise HTTPException(status_code=404, detail="Equipment not available")

    db_loan_request = models.LoanRequest(
        user_id=user_id,
        equipment_id=equipment_id,
        borrow_date=datetime.now(),
        return_date=return_date
    )
    db.add(db_loan_request)
    db.commit()
    db.refresh(db_loan_request)

    db_equipment.available_quantity -= 1
    db.commit()

    return db_loan_request

def get_loan_requests(db: Session, status: str = None, user_id: int = None):
     query = db.query(models.LoanRequest).all()
     return query
