from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordBearer

from common.database import get_task_db
from common.security import verify_token
from services.task_service import models, schemas

router = APIRouter()

# oauth2_scheme tells FastAPI where to look for the token (Authorization Header)
# tokenUrl points to your Auth Service login route
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/api/v1/login")

# --- AUTHENTICATION DEPENDENCY ---
def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Decodes the Bearer token and extracts user identity.
    This allows the Task Service to be 'stateless'.
    """
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Return a dictionary with the data we injected during login
    return {
        "id": payload.get("task_id"), 
        "role": payload.get("role"),
        "username": payload.get("sub")
    }


@router.post("/", response_model=schemas.TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: schemas.TaskCreate, 
    db: Session = Depends(get_task_db),
    current_user: dict = Depends(get_current_user)
):
    # Mapping the incoming JSON to the Database Model
    new_task = models.Task(
        **task_in.model_dump(),
        owner_username=current_user["username"]
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


# --- 2. GET TASKS (Role-Based Access) ---
@router.get("/", response_model=List[schemas.TaskOut])
def get_tasks(
    db: Session = Depends(get_task_db),
    current_user: dict = Depends(get_current_user)
):
    # RBAC: Admins see the full list, Users see only their own creations
    if current_user["role"] == "admin":
        return db.query(models.Task).all()
    
    return db.query(models.Task).filter(
        models.Task.owner_username == current_user["username"]
    ).all()


# --- 3. UPDATE TASK ---
@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_task_db),
    current_user: dict = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Security Check: Only the owner or an Admin can modify this resource
    if task.owner_username != current_user["username"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to update this task"
        )

    # Partial update (only changes the fields provided in the request body)
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    return task


# --- 4. DELETE TASK ---
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_task_db),
    current_user: dict = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Security Check: Only the owner or an Admin can delete
    if task.owner_username != current_user["username"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to delete this task"
        )

    db.delete(task)
    db.commit()
    return None 