#!/usr/bin/env python3
"""
Script to remove redundant transactions from the database.
This script identifies duplicate transactions based on date, description, and amount,
and removes all but one copy of each duplicate.
"""

import sys
import os
from sqlalchemy import func, and_
from sqlalchemy.orm import aliased

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal, engine
from app.models.transaction import Transaction

def remove_duplicate_transactions():
    """
    Remove duplicate transactions from the database.
    Duplicates are identified by having the same date, description, and amount.
    """
    # Create a session
    db = SessionLocal()
    
    try:
        print("Starting duplicate transaction removal process...")
        
        # First, identify duplicate transactions
        # We consider transactions to be duplicates if they have the same date, description, and amount
        # We'll keep transactions that are already assigned to a user
        
        # Count the duplicates to see how many we'll be removing
        duplicate_count = db.query(
            Transaction.date, 
            Transaction.description, 
            Transaction.amount,
            func.count().label('count')
        ).group_by(
            Transaction.date, 
            Transaction.description, 
            Transaction.amount
        ).having(
            func.count() > 1
        ).count()
        
        print(f"Found {duplicate_count} sets of duplicate transactions.")
        
        if duplicate_count == 0:
            print("No duplicate transactions found. Database is clean.")
            return
        
        # Get the IDs of transactions to keep (one from each duplicate set)
        # We'll keep the transaction with the lowest ID (oldest) or one that's assigned to a user
        subquery = db.query(
            Transaction.date, 
            Transaction.description, 
            Transaction.amount,
            func.min(Transaction.id).label('min_id')
        ).group_by(
            Transaction.date, 
            Transaction.description, 
            Transaction.amount
        ).subquery()
        
        # Get all transactions that are duplicates and not the ones we want to keep
        # This version removes all duplicates regardless of user assignment
        t1 = aliased(Transaction)
        duplicate_transactions = db.query(t1).join(
            subquery,
            and_(
                t1.date == subquery.c.date,
                t1.description == subquery.c.description,
                t1.amount == subquery.c.amount,
                t1.id != subquery.c.min_id
                # Removed the user_id filter to delete all duplicates
            )
        ).all()
        
        print(f"Preparing to delete {len(duplicate_transactions)} duplicate transactions...")
        
        # Delete the duplicate transactions
        for transaction in duplicate_transactions:
            db.delete(transaction)
        
        # Commit the changes
        db.commit()
        
        print(f"Successfully removed {len(duplicate_transactions)} duplicate transactions.")
        
    except Exception as e:
        db.rollback()
        print(f"Error removing duplicate transactions: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    remove_duplicate_transactions()
