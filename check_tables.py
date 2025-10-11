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
        # Show all tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("Tables in wearup_db:")
        for table in tables:
            print(table[0])
finally:
    connection.close()
