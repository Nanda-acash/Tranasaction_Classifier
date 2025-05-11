from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    color = Column(String, default="#808080")  # Default color for visualization
    
    # Relationship with Transaction
    transactions = relationship("Transaction", back_populates="category")
