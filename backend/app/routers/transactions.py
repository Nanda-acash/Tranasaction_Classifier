from typing import List, Optional, Dict
from datetime import datetime, date
import calendar
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.database import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.user import User
from app.security import get_current_active_user

# Common keywords for auto-categorization
CATEGORY_KEYWORDS = {
    'Groceries': ['grocery', 'supermarket', 'food', 'market', 'whole foods', 'walmart', 'target', 'safeway', 'kroger', 'aldi'],
    'Dining': ['restaurant', 'cafe', 'coffee', 'dinner', 'lunch', 'breakfast', 'pizza', 'burger', 'starbucks', 'mcdonald', 'taco', 'sushi'],
    'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'train', 'transit', 'parking', 'bus', 'subway', 'metro', 'chevron', 'shell'],
    'Shopping': ['amazon', 'store', 'shop', 'mall', 'clothing', 'retail', 'purchase', 'ebay', 'etsy', 'gap', 'apple store'],
    'Entertainment': ['movie', 'theater', 'cinema', 'netflix', 'spotify', 'hulu', 'disney', 'ticket', 'concert', 'event', 'game', 'amc'],
    'Utilities': ['electric', 'water', 'gas', 'power', 'utility', 'internet', 'phone', 'bill', 'service', 'cable', 'broadband'],
    'Housing': ['rent', 'mortgage', 'property', 'apartment', 'home', 'house', 'real estate', 'hoa', 'maintenance'],
    'Health': ['doctor', 'medical', 'pharmacy', 'healthcare', 'dental', 'hospital', 'clinic', 'medicine', 'prescription', 'walgreens', 'cvs'],
    'Income': ['salary', 'deposit', 'payroll', 'payment', 'income', 'direct deposit', 'wage', 'transfer', 'refund', 'tax return'],
    'Subscriptions': ['subscription', 'membership', 'monthly', 'annual', 'recurring', 'fee']
}

def auto_categorize_transaction(db: Session, description: str) -> Optional[int]:
    """Auto-categorize a transaction based on its description"""
    # Convert description to lowercase for case-insensitive matching
    description_lower = description.lower()
    
    # First, check if we already have a category for this transaction
    # Look for similar transactions that have been categorized
    similar_transaction = db.query(Transaction).filter(
        Transaction.description.ilike(f"%{description_lower}%"),
        Transaction.category_id.isnot(None)
    ).first()
    
    if similar_transaction and similar_transaction.category_id:
        return similar_transaction.category_id
    
    # If no similar transaction found, use keyword matching
    for category_name, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in description_lower:
                # Check if category exists
                category = db.query(Category).filter(Category.name == category_name).first()
                
                # If category doesn't exist, create it
                if not category:
                    category = Category(name=category_name, color=generate_color_for_category(category_name))
                    db.add(category)
                    db.commit()
                    db.refresh(category)
                
                return category.id
    
    # If no match found, return None (uncategorized)
    return None

def generate_color_for_category(category_name: str) -> str:
    """Generate a consistent color for a category based on its name"""
    # Simple hash function to generate a color
    hash_value = sum(ord(c) for c in category_name)
    # Generate a hue value between 0 and 360
    hue = hash_value % 360
    # Return a HSL color with fixed saturation and lightness
    return f"hsl({hue}, 70%, 50%)"
from app.schemas.transaction import (
    TransactionCreate, 
    TransactionUpdate, 
    Transaction as TransactionSchema,
    TransactionUploadResponse
)

router = APIRouter()

@router.get("/", response_model=List[TransactionSchema])
def get_transactions(
    skip: int = 0, 
    limit: int = 100, 
    category_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all transactions with optional filtering"""
    query = db.query(Transaction)
    
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
    
    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")
    
    transactions = query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()
    return transactions

@router.post("/", response_model=TransactionSchema)
def create_transaction(
    transaction: TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new transaction"""
    # Check if category exists if provided
    if transaction.category_id:
        category = db.query(Category).filter(Category.id == transaction.category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/{transaction_id}", response_model=TransactionSchema)
def get_transaction(
    transaction_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific transaction by ID"""
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a transaction"""
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}

@router.post("/upload-csv", response_model=TransactionUploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    save_to_user: bool = False
):
    """Upload and process a CSV file of transactions"""
    # Validate file extension
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        # Read CSV content
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Parse CSV with pandas
        try:
            df = pd.read_csv(pd.io.common.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
        
        # Validate required columns
        required_columns = ['Date', 'Description', 'Amount']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file contains no data rows")
        
        # Process transactions
        total_rows = len(df)
        successful = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                # Validate required fields
                if pd.isna(row['Date']) or pd.isna(row['Description']) or pd.isna(row['Amount']):
                    errors.append(f"Error in row {idx+2}: Missing required values")
                    continue
                
                # Convert date string to date object
                try:
                    transaction_date = datetime.strptime(str(row['Date']), "%Y-%m-%d").date()
                except ValueError:
                    try:
                        transaction_date = datetime.strptime(str(row['Date']), "%m/%d/%Y").date()
                    except ValueError:
                        try:
                            transaction_date = datetime.strptime(str(row['Date']), "%d/%m/%Y").date()
                        except ValueError:
                            errors.append(f"Error in row {idx+2}: Invalid date format. Use YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY")
                            continue
                
                # Validate and convert amount
                try:
                    amount = float(row['Amount'])
                except (ValueError, TypeError):
                    errors.append(f"Error in row {idx+2}: Invalid amount value")
                    continue
                
                # Determine transaction type based on amount
                transaction_type = "credit" if amount >= 0 else "debit"
                
                # Get raw text if available
                raw_text = str(row['RawText']) if 'RawText' in df.columns and not pd.isna(row['RawText']) else None
                
                # Try to auto-categorize the transaction based on description
                category_id = auto_categorize_transaction(db, str(row['Description']))
                
                # Create transaction object
                transaction = Transaction(
                    date=transaction_date,
                    description=str(row['Description']),
                    amount=abs(amount),  # Store absolute amount
                    transaction_type=transaction_type,
                    raw_text=raw_text,
                    category_id=category_id,
                    user_id=current_user.id if save_to_user else None
                )
                
                db.add(transaction)
                successful += 1
                
            except Exception as e:
                errors.append(f"Error in row {idx+2}: {str(e)}")
        
        # Commit all successful transactions
        if successful > 0:
            db.commit()
        
        return {
            "total_imported": total_rows,
            "successful": successful,
            "failed": total_rows - successful,
            "errors": errors if errors else None
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"CSV Upload Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")

@router.post("/save-to-user", status_code=status.HTTP_200_OK)
def save_transactions_to_user(
    transaction_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Save transactions to the current user"""
    if not transaction_ids:
        raise HTTPException(status_code=400, detail="No transaction IDs provided")
    
    # Get transactions by IDs
    transactions = db.query(Transaction).filter(Transaction.id.in_(transaction_ids)).all()
    
    if not transactions:
        raise HTTPException(status_code=404, detail="No transactions found with the provided IDs")
    
    # Associate transactions with the current user
    for transaction in transactions:
        transaction.user_id = current_user.id
    
    db.commit()
    
    return {"message": f"Successfully saved {len(transactions)} transactions to user", "count": len(transactions)}

@router.get("/summary/monthly", response_model=Dict[str, Dict[str, float]])
def get_monthly_summary(
    year: int = Query(..., description="Year for the monthly summary"),
    month: Optional[int] = Query(None, description="Month for the summary (1-12). If not provided, returns all months."),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get monthly spending summary by category"""
    # Build the base query
    query = db.query(
        extract('month', Transaction.date).label('month'),
        Category.name.label('category_name'),
        func.sum(Transaction.amount).label('total_amount')
    ).join(
        Category,
        Transaction.category_id == Category.id
    ).filter(
        extract('year', Transaction.date) == year,
        Transaction.transaction_type == 'debit'  # Only include expenses
    )
    
    # Filter by month if provided
    if month:
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
        query = query.filter(extract('month', Transaction.date) == month)
    
    # Filter by user_id if transactions are associated with users
    if current_user:
        query = query.filter(Transaction.user_id == current_user.id)
    
    # Group by month and category
    query = query.group_by(
        extract('month', Transaction.date),
        Category.name
    ).order_by(
        extract('month', Transaction.date),
        Category.name
    )
    
    results = query.all()
    
    # Format results as a nested dictionary: {month: {category: amount}}
    summary = {}
    for result in results:
        month_name = calendar.month_name[int(result.month)]
        if month_name not in summary:
            summary[month_name] = {}
        summary[month_name][result.category_name] = float(result.total_amount)
    
    return summary

@router.get("/summary/by-category", response_model=List[dict])
def get_summary_by_category(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a summary of transactions grouped by category"""
    query = db.query(
        Category.id,
        Category.name,
        Category.color,
        func.sum(Transaction.amount).label("total_amount"),
        func.count(Transaction.id).label("transaction_count")
    ).join(
        Transaction, 
        Category.id == Transaction.category_id, 
        isouter=True
    )
    
    # Filter by user_id if transactions are associated with users
    if current_user:
        query = query.filter(Transaction.user_id == current_user.id)
    
    # Filter by transaction type if specified
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
        
    query = query.group_by(
        Category.id
    )
    
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
    
    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")
    
    results = query.all()
    
    # Format results as a list of dictionaries
    summary = []
    for result in results:
        summary.append({
            "category_id": result.id,
            "category_name": result.name,
            "color": result.color,
            "total_amount": float(result.total_amount) if result.total_amount else 0.0,
            "transaction_count": result.transaction_count
        })
    
    return summary
