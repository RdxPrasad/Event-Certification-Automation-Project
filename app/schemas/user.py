from pydantic import BaseModel
from datetime import datetime 

class UserCreate(BaseModel) :

    full_name : str 
    email : str
    password : str 
    role : str = "student"

class UserResponse(BaseModel) :

    id : int 
    full_name : str
    email : str 
    role : str 
    created_at : datetime