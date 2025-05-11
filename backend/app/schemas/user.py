from typing import Optional
from pydantic import BaseModel, Field

# Shared properties
class UserBase(BaseModel):
    username: str

# Properties to receive on user creation
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# Properties to receive on user login
class UserLogin(BaseModel):
    username: str
    password: str

# Properties to return to client
class User(UserBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

# Token response
class Token(BaseModel):
    access_token: str
    token_type: str

# Token data for JWT
class TokenData(BaseModel):
    username: Optional[str] = None
