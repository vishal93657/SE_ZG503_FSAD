from fastapi import FastAPI,HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import models, database, crud, schemas, utils

app = FastAPI(
    title="SCHOOL EQUIPMENT LENDING PORTAL"
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup():
    """
    Startup event handler to initialize the database tables when the application starts.
    """
    database.init_db()



@app.post("/signup", response_model=schemas.UserProfile)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user.

    Parameters
    ----------
    user : schemas.UserCreate
        The user registration data, including a plain text password.
    db : Session, optional
        The database session dependency.

    Raises
    ------
    HTTPException
        400 if the username is already taken.

    Returns
    -------
    schemas.UserProfile
        The profile data of the newly created user.
    """
    existing_user = crud.get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    created_user = crud.create_user(db, user)
    return created_user

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a user and returns an access token upon success.

    Parameters
    ----------
    user : schemas.UserLogin
        The user login credentials.
    db : Session, optional
        The database session dependency.

    Raises
    ------
    HTTPException
        401 if the username or password is invalid.

    Returns
    -------
    dict
        A dictionary containing the access token and token type.
    """
    db_user = crud.verify_user_password(db, user.username, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = utils.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/profile/{username}", response_model=schemas.UserProfile)
def profile(username: str, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Retrieves the profile of the authenticated user.

    Parameters
    ----------
    username : str
        The username from the URL path (not strictly used for lookup,
        the username is derived from the token payload).
    token : str, optional
        The OAuth2 access token dependency.
    db : Session, optional
        The database session dependency.

    Raises
    ------
    HTTPException
        401 if the token is invalid or expired.
        404 if the user specified in the token is not found.

    Returns
    -------
    schemas.UserProfile
        The profile data of the authenticated user.
    """
    payload = utils.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    username = payload.get("sub")
    db_user = crud.get_user_by_username(db, username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return db_user

@app.post("/logout")
def logout():
    """
    Placeholder for a client-side logout operation (e.g., deleting the token).

    Returns
    -------
    dict
        A success message.
    """
    return {"msg": "Logged out successfully"}

@app.post("/equipment", response_model=schemas.Equipment)
def create_equipment(equipment: schemas.EquipmentCreate, db: Session = Depends(get_db)):
    """
    Creates a new equipment item (Admin/Staff only operation, assuming middleware).

    Parameters
    ----------
    equipment : schemas.EquipmentCreate
        The data for the new equipment item.
    db : Session, optional
        The database session dependency.

    Returns
    -------
    schemas.Equipment
        The details of the created equipment item.
    """
    return crud.create_equipment(db=db, equipment=equipment)

@app.get("/equipment", response_model=List[schemas.Equipment])
def get_equipment(db: Session = Depends(get_db)):
    """
    Retrieves a list of all available equipment items.

    Parameters
    ----------
    db : Session, optional
        The database session dependency.

    Returns
    -------
    List[schemas.Equipment]
        A list of available equipment.
    """
    return crud.get_equipment(
        db=db)

@app.post("/borrow/{equipment_id}", response_model=schemas.LoanRequest)
def borrow_equipment(equipment_id: int, loan_request: schemas.LoanRequestCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Creates a loan request for a specific equipment item.

    Parameters
    ----------
    equipment_id : int
        The ID of the equipment to borrow.
    loan_request : schemas.LoanRequestCreate
        The loan request details (return date, quantity).
    token : str, optional
        The OAuth2 access token dependency.
    db : Session, optional
        The database session dependency.

    Raises
    ------
    HTTPException
        401 if the token is invalid or expired.
        404 if equipment is not available (handled in crud).

    Returns
    -------
    schemas.LoanRequest
        The created loan request details.
    """
    payload = utils.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid/expired token")
    
    username = payload.get("sub")
    db_user = crud.get_user_by_username(db, username)
    user_id = db_user.id
    return crud.borrow_equipment(db=db, equipment_id=equipment_id, user_id=user_id, return_date=loan_request.return_date,  quantity=loan_request.quantity )

@app.patch("/equipment/{equipment_id}", response_model=schemas.Equipment)
def patch_equipment(equipment_id: int, equipment_update: schemas.EquipmentUpdate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """
    Updates details of an existing equipment item (Admin/Staff only operation, assuming middleware).

    Parameters
    ----------
    equipment_id : int
        The ID of the equipment to update.
    equipment_update : schemas.EquipmentUpdate
        The fields to update for the equipment.
    db : Session, optional
        The database session dependency.
    token : str, optional
        The OAuth2 access token dependency.

    Raises
    ------
    HTTPException
        401 if the token is invalid or expired.
        404 or 400 (handled in crud) if the update fails.

    Returns
    -------
    schemas.Equipment
        The updated equipment details.
    """
    payload = utils.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid/expired token")
    return crud.update_equipment(
        db=db, 
        equipment_id=equipment_id, 
        equipment_update=equipment_update
    )

@app.delete("/equipment/{equipment_id}", response_model=schemas.Equipment)
def delete_equipment(equipment_id:int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """
    Deletes an equipment item (Admin/Staff only operation, assuming middleware).

    Parameters
    ----------
    equipment_id : int
        The ID of the equipment to delete.
    db : Session, optional
        The database session dependency.
    token : str, optional
        The OAuth2 access token dependency.

    Raises
    ------
    HTTPException
        401 if the token is invalid or expired.
        404 or 400 (handled in crud) if the deletion fails.

    Returns
    -------
    schemas.Equipment
        The deleted equipment details.
    """
    payload = utils.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid/expired token")
    return crud.delete_equipment(db=db, equipment_id=equipment_id)

@app.patch("/loan_requests/{loan_request_id}", response_model=schemas.LoanRequest)
def update_loan_request(loan_request_id: int, status_update: schemas.LoanRequestStatusUpdate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """
    Updates the status of a loan request (e.g., 'accepted', 'returned')
    (Admin/Staff only operation, assuming middleware).

    Parameters
    ----------
    loan_request_id : int
        The ID of the loan request to update.
    status_update : schemas.LoanRequestStatusUpdate
        The new status for the loan request.
    db : Session, optional
        The database session dependency.
    token : str, optional
        The OAuth2 access token dependency.

    Raises
    ------
    HTTPException
        401 if the token is invalid or expired.
        404 or 400 (handled in crud) if the update fails.

    Returns
    -------
    schemas.LoanRequest
        The updated loan request details.
    """
    payload = utils.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid/expired token")

    return crud.update_loan_request_status(db=db, loan_request_id=loan_request_id, status_update=status_update)

@app.get("/loan_requests", response_model=List[schemas.LoanRequest])
def get_loan_requests(db: Session = Depends(get_db)):
    """
    Retrieves a list of all loan requests (Admin/Staff only, assuming middleware).

    Parameters
    ----------
    db : Session, optional
        The database session dependency.

    Returns
    -------
    List[schemas.LoanRequest]
        A list of all loan requests.
    """
    return crud.get_loan_requests(db=db)
