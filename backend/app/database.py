import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection URL
# Use SQLite for simplicity
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./transaction_classifier.db"
)

# Create SQLAlchemy engine
# For SQLite, we need to add connect_args to handle multiple threads
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
