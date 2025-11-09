from sqlalchemy.orm import Session
import models, schemas, utils
from datetime import datetime
from fastapi import HTTPException


def create_user(db: Session, user: schemas.UserCreate):
    """
    Creates a new user and stores them in the database.
    Parameters
    ----------
    db : Session
        The SQLAlchemy database session.
    user : schemas.UserCreate
        Pydantic schema containing user details (username, email, password, role).
    Returns
    -------
    models.User
        The newly created User database object.
    """
    hashed_password = utils.hash_password(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    """
    Retrieves a user by their unique username.

    Parameters
    ----------
    db : Session
        The SQLAlchemy database session.
    username : str
        The username of the user to retrieve.

    Returns
    -------
    models.User or None
        The User database object if found, otherwise None.
    """
    return db.query(models.User).filter(models.User.username == username).first()


def verify_user_password(db: Session, username: str, password: str):
    """
    Verifies a user's password against the hashed password in the database.

    Parameters
    ----------
    db : Session
        The SQLAlchemy database session.
    username : str
        The username of the user.
    password : str
        The plain text password provided by the user.

    Returns
    -------
    models.User or None
        The User object if credentials are valid, otherwise None.
    """
    user = get_user_by_username(db, username)
    if user and utils.verify_password(password, user.hashed_password):
        return user
    return None

def create_equipment(db: Session, equipment: schemas.EquipmentCreate):
    """
    Creates a new equipment item in the database.
    Sets the initial available_quantity equal to the total quantity.

    Parameters
    ----------
    db : Session
        The SQLAlchemy database session.
    equipment : schemas.EquipmentCreate
        Pydantic schema containing equipment details.

    Returns
    -------
    models.Equipment
        The newly created Equipment database object.
    """
    db_equipment = models.Equipment(**equipment.dict())
    db_equipment.available_quantity = db_equipment.quantity
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

def get_equipment(db: Session):
    """
    Retrieves all equipment items that have an available quantity greater than 0.

    Parameters
    ----------
    db : Session
        The SQLAlchemy database session.

    Returns
    -------
    List[models.Equipment]
        A list of available Equipment database objects.
    """
    return db.query(models.Equipment).filter(models.Equipment.available_quantity > 0).all()

def borrow_equipment(db: Session, equipment_id: int, user_id: int, return_date: datetime, quantity: int):
    """
    Creates a new loan request for a specific equipment item.

    Parameters
    ----------
    db : Session
        The SQLAlchemy database session.
    equipment_id : int
        The ID of the equipment to be borrowed.
    user_id : int
        The ID of the user borrowing the equipment.
    return_date : datetime
        The scheduled return date.
    quantity : int
        The number of items to borrow.

    Raises
    ------
    HTTPException
        404 if the equipment is not available or found.

    Returns
    -------
    models.LoanRequest
        The created LoanRequest database object.
    """
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
    """
    Updates details of an existing equipment item. Handles automatic
    adjustment of 'available_quantity' if 'quantity' (total) is changed.

    Parameters
    ----------
    db : Session
        The SQLAlchemy database session.
    equipment_id : int
        The ID of the equipment to update.
    equipment_update : schemas.EquipmentUpdate
        Pydantic schema with fields to update.

    Raises
    ------
    HTTPException
        404 if the equipment is not found.
        400 if reducing the total quantity would make available quantity negative.

    Returns
    -------
    models.Equipment
        The updated Equipment database object.
    """
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
    """
    Deletes an equipment item from the database.
    Deletion is only allowed if all items are currently available (none on loan).

    Parameters
    ----------
    db : Session
        The SQLAlchemy database session.
    equipment_id : int
        The ID of the equipment to delete.

    Raises
    ------
    HTTPException
        404 if the equipment is not found.
        400 if some items are still on loan.

    Returns
    -------
    models.Equipment
        The deleted Equipment database object.
    """
    db_equipment = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if db_equipment.quantity != db_equipment.available_quantity:
        raise HTTPException(status_code=400, detail="Cannot delete equipment. Some items are still on loan.")
    db.delete(db_equipment)
    db.commit()
    return db_equipment


def update_loan_request_status(db: Session, loan_request_id:int, status_update: schemas.LoanRequestStatusUpdate):
    """
    Updates the status of a loan request (e.g., 'accepted' or 'returned').
    Adjusts the equipment's available quantity based on the status change.

    Parameters
    ----------
    db : Session
        The SQLAlchemy database session.
    loan_request_id : int
        The ID of the loan request to update.
    status_update : schemas.LoanRequestStatusUpdate
        Pydantic schema containing the new status.

    Raises
    ------
    HTTPException
        404 if the loan request is not found.
        400 if the status transition is invalid or if there's insufficient
             equipment quantity for 'accepted' status.

    Returns
    -------
    models.LoanRequest
        The updated LoanRequest database object.
    """
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
     """
    Retrieves all loan requests from the database.

    Note: This function currently retrieves all requests without filtering
    by status or user_id as those arguments are not used in the implementation.

    Parameters
    ----------
    db : Session
        The SQLAlchemy database session.
    status : str, optional
        Filter by loan status (e.g., 'pending', 'accepted'). Currently unused.
    user_id : int, optional
        Filter by the user ID who made the request. Currently unused.

    Returns
    -------
    List[models.LoanRequest]
        A list of all LoanRequest database objects.
    """
     query = db.query(models.LoanRequest).all()
     return query
