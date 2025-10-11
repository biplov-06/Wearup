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
        
        if 'sku' not in column_names:
            cursor.execute("ALTER TABLE WearUpBack_product ADD COLUMN sku varchar(100) NULL")
            connection.commit()
            print("Added sku column.")
        else:
            print("sku column already exists.")
finally:
    connection.close()
