from typing import Optional, List
from pydantic import BaseModel

# Shared properties
class CategoryBase(BaseModel):
    name: str
    color: Optional[str] = "#808080"

# Properties to receive on category creation
class CategoryCreate(CategoryBase):
    pass

# Properties to receive on category update
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

# Properties shared by models stored in DB
class CategoryInDBBase(CategoryBase):
    id: int
    
    class Config:
        orm_mode = True

# Properties to return to client
class Category(CategoryInDBBase):
    pass

# Properties properties stored in DB
class CategoryInDB(CategoryInDBBase):
    pass
