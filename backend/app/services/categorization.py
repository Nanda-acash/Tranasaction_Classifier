from typing import Dict, List, Optional
import re
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.transaction import Transaction

class CategorizationService:
    """Service for auto-categorizing transactions based on their descriptions"""
    
    def __init__(self, db: Session):
        self.db = db
        self.category_rules = {}
        self._load_category_rules()
    
    def _load_category_rules(self):
        """Load category rules from the database"""
        # This could be extended to load rules from a separate table
        # For now, we'll use a simple mapping of keywords to categories
        categories = self.db.query(Category).all()
        
        # Default rules based on common transaction descriptions
        default_rules = {
            "Groceries": ["supermarket", "grocery", "food", "market"],
            "Dining": ["restaurant", "cafe", "coffee", "takeout", "food delivery"],
            "Transportation": ["uber", "lyft", "taxi", "transport", "gas", "fuel", "parking"],
            "Utilities": ["electric", "water", "gas", "internet", "phone", "utility"],
            "Housing": ["rent", "mortgage", "property"],
            "Entertainment": ["movie", "cinema", "theatre", "concert", "subscription"],
            "Shopping": ["amazon", "walmart", "target", "store", "shop"],
            "Health": ["doctor", "medical", "pharmacy", "health", "fitness"],
            "Travel": ["hotel", "flight", "airline", "airbnb", "booking"],
            "Income": ["salary", "deposit", "income", "payment received"]
        }
        
        # Create any missing categories with default rules
        for category_name, keywords in default_rules.items():
            category = next((c for c in categories if c.name.lower() == category_name.lower()), None)
            
            if not category:
                # Create the category if it doesn't exist
                category = Category(name=category_name)
                self.db.add(category)
                self.db.commit()
                self.db.refresh(category)
                categories.append(category)
            
            # Add rules for this category
            self.category_rules[category.id] = keywords
    
    def categorize_transaction(self, transaction: Transaction) -> Optional[int]:
        """
        Categorize a transaction based on its description
        Returns the category ID if a match is found, None otherwise
        """
        if not transaction.description:
            return None
        
        description = transaction.description.lower()
        
        # Try to find a matching category based on keywords
        for category_id, keywords in self.category_rules.items():
            for keyword in keywords:
                if keyword.lower() in description:
                    return category_id
        
        return None
    
    def categorize_all_uncategorized(self) -> Dict[str, int]:
        """
        Categorize all uncategorized transactions
        Returns a summary of how many transactions were categorized
        """
        uncategorized = self.db.query(Transaction).filter(
            Transaction.category_id == None
        ).all()
        
        categorized_count = 0
        
        for transaction in uncategorized:
            category_id = self.categorize_transaction(transaction)
            if category_id:
                transaction.category_id = category_id
                categorized_count += 1
        
        if categorized_count > 0:
            self.db.commit()
        
        return {
            "total_uncategorized": len(uncategorized),
            "categorized": categorized_count,
            "remaining_uncategorized": len(uncategorized) - categorized_count
        }
