from fastapi import FastAPI,HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import models, database, crud, schemas, utils

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup():
    print("UP ") 
    database.init_db()



@app.post("/signup", response_model=schemas.UserProfile)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    created_user = crud.create_user(db, user)
    return created_user

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.verify_user_password(db, user.username, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = utils.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/profile/{username}", response_model=schemas.UserProfile)
def profile(username: str, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    return {"msg": "Logged out successfully"}

@app.post("/equipment", response_model=schemas.Equipment)
def create_equipment(equipment: schemas.EquipmentCreate, db: Session = Depends(get_db)):
    return crud.create_equipment(db=db, equipment=equipment)

@app.get("/equipment", response_model=List[schemas.Equipment])
def get_equipment(db: Session = Depends(get_db)):
    return crud.get_equipment(
        db=db)

@app.post("/borrow/{equipment_id}", response_model=schemas.LoanRequest)
def borrow_equipment(equipment_id: int, loan_request: schemas.LoanRequestCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = utils.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid/expired token")
    
    username = payload.get("sub")
    db_user = crud.get_user_by_username(db, username)
    user_id = db_user.id
    return crud.borrow_equipment(db=db, equipment_id=equipment_id, user_id=user_id, return_date=loan_request.return_date,  quantity=loan_request.quantity )

@app.patch("/equipment/{equipment_id}", response_model=schemas.Equipment)
def patch_equipment(equipment_id: int, equipment_update: schemas.EquipmentUpdate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = utils.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid/expired token")
    return crud.update_equipment(
        db=db, 
        equipment_id=equipment_id, 
        equipment_update=equipment_update
    )

@app.patch("/loan_requests/{loan_request_id}", response_model=schemas.LoanRequest)
def update_loan_request(loan_request_id: int, status_update: schemas.LoanRequestStatusUpdate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = utils.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid/expired token")

    return crud.update_loan_request_status(db=db, loan_request_id=loan_request_id, status_update=status_update)

@app.get("/loan_requests", response_model=List[schemas.LoanRequest])
def get_loan_requests(db: Session = Depends(get_db)):
    return crud.get_loan_requests(db=db)
