from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserInDB
from app.crud import crud_user
from app.api import deps

router = APIRouter()

@router.post("/users", response_model=UserInDB)
def create_user(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    return crud_user.create_user(db=db, user=user_in)

