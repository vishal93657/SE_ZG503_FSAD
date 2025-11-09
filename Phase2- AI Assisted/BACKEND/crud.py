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

def borrow_equipment(db: Session, equipment_id: int, user_id: int, return_date: datetime, quantity: int):
    db_equipment = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not db_equipment or db_equipment.available_quantity <= 0:
        raise HTTPException(status_code=404, detail="Equipment not available")

    db_loan_request = models.LoanRequest(
        user_id=user_id,
        equipment_id=equipment_id,
        borrow_date=datetime.now(),
        return_date=return_date,
        quantity=quantity
    )
    db.add(db_loan_request)
    db.commit()
    db.refresh(db_loan_request)
    return db_loan_request

def update_equipment(db: Session, equipment_id: int, equipment_update: schemas.EquipmentUpdate):
    db_equipment = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()

    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    update_data = equipment_update.dict(exclude_unset=True)

    if "quantity" in update_data:
        new_total_quantity = update_data["quantity"]
        
        items_on_loan = db_equipment.quantity - db_equipment.available_quantity
        new_available_quantity = new_total_quantity - items_on_loan
        
        if new_available_quantity < 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot reduce total quantity to {new_total_quantity}. {items_on_loan} items are currently on loan."
            )
        
        db_equipment.available_quantity = new_available_quantity

    for key, value in update_data.items():
        setattr(db_equipment, key, value)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

def delete_equipment(db: Session, equipment_id: int):
    db_equipment = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if db_equipment.quantity != db_equipment.available_quantity:
        raise HTTPException(status_code=400, detail="Cannot delete equipment. Some items are still on loan.")
    db.delete(db_equipment)
    db.commit()
    return db_equipment


def update_loan_request_status(db: Session, loan_request_id:int, status_update: schemas.LoanRequestStatusUpdate):
    db_loan_request = db.query(models.LoanRequest).filter(models.LoanRequest.id == loan_request_id).first()

    if not db_loan_request:
        raise HTTPException(status_code=404, detail="Loan request not found")

    new_status = status_update.status
    current_status = db_loan_request.status
    
    if new_status == "accepted":
        if current_status != "pending":
            raise HTTPException(status_code=400, detail=f"Only pending requests can be accepted.")
        db_equipment = db.query(models.Equipment).filter(models.Equipment.id == db_loan_request.equipment_id).first()
        
        if not db_equipment or db_equipment.available_quantity < db_loan_request.quantity:
            raise HTTPException(status_code=400, detail="Insufficient equipment quantity to approve this request")
        
        db_equipment.available_quantity -= db_loan_request.quantity
    
    elif new_status == "returned":
        if current_status != "accepted":
            raise HTTPException(status_code=400, detail=f"Only accepted requests can be returned.")

        db_equipment = db.query(models.Equipment).filter(models.Equipment.id == db_loan_request.equipment_id).first()
        db_equipment.available_quantity += db_loan_request.quantity

    db_loan_request.status = new_status
    db.commit()
    db.refresh(db_loan_request)
    return db_loan_request

def get_loan_requests(db: Session, status: str = None, user_id: int = None):
     query = db.query(models.LoanRequest).all()
     return query
