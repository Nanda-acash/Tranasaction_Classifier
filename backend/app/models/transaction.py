from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    description = Column(String, index=True)
    amount = Column(Float)
    transaction_type = Column(String)  # debit or credit
    raw_text = Column(String, nullable=True)  # Raw text from bank statement
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # User who owns this transaction
    
    # Relationship with Category
    category = relationship("Category", back_populates="transactions")
    
    # Relationship with User
    user = relationship("User", back_populates="transactions")
