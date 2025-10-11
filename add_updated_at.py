import pymysql

connection = pymysql.connect(
    host='localhost',
    user='root',
    password='root',
    database='wearup_db'
)

try:
    with connection.cursor() as cursor:
        cursor.execute("DESCRIBE WearUpBack_product")
        columns = cursor.fetchall()
        column_names = [col[0] for col in columns]
        
        if 'updated_at' not in column_names:
            cursor.execute("ALTER TABLE WearUpBack_product ADD COLUMN updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
            connection.commit()
            print("Added updated_at column.")
        else:
            print("updated_at column already exists.")
finally:
    connection.close()
