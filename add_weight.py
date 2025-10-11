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
        
        if 'weight' not in column_names:
            cursor.execute("ALTER TABLE WearUpBack_product ADD COLUMN weight decimal(10,2) NULL")
            connection.commit()
            print("Added weight column.")
        else:
            print("weight column already exists.")
finally:
    connection.close()
