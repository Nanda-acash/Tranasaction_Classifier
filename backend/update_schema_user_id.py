import sqlite3

# Connect to the database
conn = sqlite3.connect('transaction_classifier.db')
cursor = conn.cursor()

# Check if the column already exists
cursor.execute("PRAGMA table_info(transactions)")
columns = cursor.fetchall()
column_names = [column[1] for column in columns]

if 'user_id' not in column_names:
    print("Adding user_id column to transactions table...")
    # Add the user_id column
    cursor.execute("ALTER TABLE transactions ADD COLUMN user_id INTEGER REFERENCES users(id);")
    conn.commit()
    print("Column added successfully!")
else:
    print("user_id column already exists.")

# Close the connection
conn.close()
