from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.security import get_current_active_user
from app.services.categorization import CategorizationService

router = APIRouter()

@router.post("/auto-categorize")
def auto_categorize_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Auto-categorize all uncategorized transactions"""
    categorization_service = CategorizationService(db)
    result = categorization_service.categorize_all_uncategorized()
    return result
