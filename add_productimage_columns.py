import pymysql

connection = pymysql.connect(
    host='localhost',
    user='root',
    password='root',
    database='wearup_db'
)

try:
    with connection.cursor() as cursor:
        # Add alt_text column
        cursor.execute("ALTER TABLE WearUpBack_productimage ADD COLUMN alt_text VARCHAR(255) DEFAULT ''")
        connection.commit()
        print("Added alt_text column to WearUpBack_productimage.")

        # Add order column
        cursor.execute("ALTER TABLE WearUpBack_productimage ADD COLUMN `order` INT UNSIGNED DEFAULT 0")
        connection.commit()
        print("Added order column to WearUpBack_productimage.")
finally:
    connection.close()
