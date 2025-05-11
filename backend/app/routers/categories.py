from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.user import User
from app.security import get_current_active_user
from app.schemas.category import CategoryCreate, CategoryUpdate, Category as CategorySchema

router = APIRouter()

@router.get("/", response_model=List[CategorySchema])
def get_categories(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all categories"""
    categories = db.query(Category).offset(skip).limit(limit).all()
    return categories

@router.post("/", response_model=CategorySchema)
def create_category(
    category: CategoryCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new category"""
    db_category = db.query(Category).filter(Category.name == category.name).first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/{category_id}", response_model=CategorySchema)
def get_category(
    category_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific category by ID"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.put("/{category_id}", response_model=CategorySchema)
def update_category(
    category_id: int, 
    category: CategoryUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}")
def delete_category(
    category_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}
