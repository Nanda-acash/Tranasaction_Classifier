from datetime import date
from typing import Optional, List
from pydantic import BaseModel, Field

# Shared properties
class TransactionBase(BaseModel):
    date: date
    description: str
    amount: float
    transaction_type: str
    raw_text: Optional[str] = None
    category_id: Optional[int] = None
    user_id: Optional[int] = None

# Properties to receive on transaction creation
class TransactionCreate(TransactionBase):
    pass

# Properties to receive on transaction update
class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    transaction_type: Optional[str] = None
    raw_text: Optional[str] = None
    category_id: Optional[int] = None
    user_id: Optional[int] = None

# Properties shared by models stored in DB
class TransactionInDBBase(TransactionBase):
    id: int
    
    class Config:
        from_attributes = True

# Properties to return to client
class Transaction(TransactionInDBBase):
    pass

# Properties properties stored in DB
class TransactionInDB(TransactionInDBBase):
    pass

# For bulk upload response
class TransactionUploadResponse(BaseModel):
    total_imported: int
    successful: int
    failed: int
    errors: Optional[List[str]] = None
