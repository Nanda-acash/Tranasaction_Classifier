import sqlite3

# Connect to the database
conn = sqlite3.connect('transaction_classifier.db')
cursor = conn.cursor()

# Check if the column already exists
cursor.execute("PRAGMA table_info(transactions)")
columns = cursor.fetchall()
column_names = [column[1] for column in columns]

if 'raw_text' not in column_names:
    print("Adding raw_text column to transactions table...")
    # Add the raw_text column
    cursor.execute("ALTER TABLE transactions ADD COLUMN raw_text TEXT;")
    conn.commit()
    print("Column added successfully!")
else:
    print("raw_text column already exists.")

# Close the connection
conn.close()
