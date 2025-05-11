from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.category import Category

def init_db():
    """Initialize the database with default data"""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already have categories
    existing_categories = db.query(Category).count()
    
    if existing_categories == 0:
        # Add default categories
        default_categories = [
            {"name": "Groceries", "color": "#4CAF50"},  # Green
            {"name": "Dining", "color": "#FF9800"},     # Orange
            {"name": "Transportation", "color": "#2196F3"},  # Blue
            {"name": "Utilities", "color": "#9C27B0"},  # Purple
            {"name": "Housing", "color": "#F44336"},    # Red
            {"name": "Entertainment", "color": "#E91E63"},  # Pink
            {"name": "Shopping", "color": "#00BCD4"},   # Cyan
            {"name": "Health", "color": "#8BC34A"},     # Light Green
            {"name": "Travel", "color": "#FFC107"},     # Amber
            {"name": "Income", "color": "#009688"},     # Teal
            {"name": "Other", "color": "#607D8B"}       # Blue Grey
        ]
        
        for category_data in default_categories:
            category = Category(**category_data)
            db.add(category)
        
        db.commit()
        print(f"Added {len(default_categories)} default categories")
    
    db.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully")
