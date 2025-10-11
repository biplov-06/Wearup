import pymysql

# Connect to the database
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='root',
    database='wearup_db'
)

try:
    with connection.cursor() as cursor:
        # Check if base_price column exists
        cursor.execute("DESCRIBE WearUpBack_product")
        columns = cursor.fetchall()
        column_names = [col[0] for col in columns]
        
        if 'base_price' in column_names:
            print("base_price column already exists.")
        else:
            # Add the column
            cursor.execute("ALTER TABLE WearUpBack_product ADD COLUMN base_price decimal(10,2) NOT NULL DEFAULT 0.00")
            connection.commit()
            print("Added base_price column.")
        
        # Print columns
        print("Columns in WearUpBack_product:")
        for col in columns:
            print(col)
finally:
    connection.close()
