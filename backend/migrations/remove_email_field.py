"""
Migration script to remove the email field from the users table
"""
from sqlalchemy import create_engine, MetaData, Table, Column, String, text
from sqlalchemy.engine import reflection
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

def run_migration():
    """Run the migration to remove email field"""
    print("Starting migration to remove email field from users table...")
    
    # Create engine and connect to the database
    engine = create_engine(DATABASE_URL)
    conn = engine.connect()
    
    # Get inspector to check if column exists
    inspector = reflection.Inspector.from_engine(engine)
    
    # Check if users table exists
    if 'users' in inspector.get_table_names():
        # Check if email column exists
        columns = [col['name'] for col in inspector.get_columns('users')]
        
        if 'email' in columns:
            print("Email column found in users table. Removing...")
            
            # Create a transaction
            trans = conn.begin()
            
            try:
                # Create a temporary table without the email column
                conn.execute(text("CREATE TABLE users_new ("
                            "id INTEGER PRIMARY KEY, "
                            "username VARCHAR UNIQUE, "
                            "hashed_password VARCHAR NOT NULL, "
                            "is_active BOOLEAN, "
                            "created_at TIMESTAMP, "
                            "updated_at TIMESTAMP)"))
                
                # Copy data from the old table to the new one
                conn.execute(text("INSERT INTO users_new "
                            "SELECT id, username, hashed_password, is_active, created_at, updated_at "
                            "FROM users"))
                
                # Drop the old table
                conn.execute(text("DROP TABLE users"))
                
                # Rename the new table
                conn.execute(text("ALTER TABLE users_new RENAME TO users"))
                
                # Create indexes
                conn.execute(text("CREATE INDEX ix_users_id ON users (id)"))
                conn.execute(text("CREATE INDEX ix_users_username ON users (username)"))
                
                # Commit the transaction
                trans.commit()
                print("Migration completed successfully!")
                
            except Exception as e:
                # Rollback in case of error
                trans.rollback()
                print(f"Migration failed: {str(e)}")
                raise
            
        else:
            print("Email column not found in users table. No migration needed.")
    else:
        print("Users table not found. No migration needed.")
    
    # Close connection
    conn.close()

if __name__ == "__main__":
    run_migration()
