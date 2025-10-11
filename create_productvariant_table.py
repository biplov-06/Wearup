import pymysql

connection = pymysql.connect(
    host='localhost',
    user='root',
    password='root',
    database='wearup_db'
)

try:
    with connection.cursor() as cursor:
        cursor.execute("""
        CREATE TABLE wearupback_productvariant (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            price_adjustment DECIMAL(10,2) DEFAULT 0,
            stock_quantity INT UNSIGNED DEFAULT 0,
            sku VARCHAR(100),
            color_id BIGINT,
            product_id BIGINT NOT NULL,
            size_id BIGINT,
            FOREIGN KEY (color_id) REFERENCES wearupback_color(id) ON DELETE SET NULL,
            FOREIGN KEY (product_id) REFERENCES WearUpBack_product(id) ON DELETE CASCADE,
            FOREIGN KEY (size_id) REFERENCES wearupback_size(id) ON DELETE SET NULL
        )
        """)
        connection.commit()
        print("Created wearupback_productvariant table.")
finally:
    connection.close()
