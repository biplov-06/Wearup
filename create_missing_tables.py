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
        # Create Address table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `WearUpBack_address` (
                `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                `address_type` varchar(10) NOT NULL,
                `full_name` varchar(100) NOT NULL,
                `street_address` varchar(255) NOT NULL,
                `city` varchar(100) NOT NULL,
                `state` varchar(100) NOT NULL,
                `postal_code` varchar(20) NOT NULL,
                `country` varchar(100) NOT NULL,
                `phone` varchar(20) NOT NULL,
                `is_default` bool NOT NULL,
                `created_at` datetime(6) NOT NULL,
                `user_id` int NOT NULL
            )
        """)
        print("Created WearUpBack_address table")

        # Create Cart table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `WearUpBack_cart` (
                `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                `created_at` datetime(6) NOT NULL,
                `updated_at` datetime(6) NOT NULL,
                `user_id` int NOT NULL UNIQUE
            )
        """)
        print("Created WearUpBack_cart table")

        # Create Order table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `WearUpBack_order` (
                `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                `order_number` varchar(20) NOT NULL,
                `status` varchar(20) NOT NULL,
                `payment_status` varchar(20) NOT NULL,
                `subtotal` decimal(10,2) NOT NULL,
                `tax_amount` decimal(10,2) NOT NULL,
                `shipping_amount` decimal(10,2) NOT NULL,
                `discount_amount` decimal(10,2) NOT NULL,
                `total_amount` decimal(10,2) NOT NULL,
                `notes` longtext NOT NULL,
                `tracking_number` varchar(100) NOT NULL,
                `created_at` datetime(6) NOT NULL,
                `updated_at` datetime(6) NOT NULL,
                `billing_address_id` bigint,
                `shipping_address_id` bigint,
                `user_id` int NOT NULL
            )
        """)
        print("Created WearUpBack_order table")

        # Create OrderItem table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `WearUpBack_orderitem` (
                `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                `quantity` int unsigned NOT NULL,
                `unit_price` decimal(10,2) NOT NULL,
                `total_price` decimal(10,2) NOT NULL,
                `order_id` bigint NOT NULL,
                `product_id` bigint NOT NULL,
                `variant_id` bigint
            )
        """)
        print("Created WearUpBack_orderitem table")

        # Create CartItem table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `WearUpBack_cartitem` (
                `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                `quantity` int unsigned NOT NULL,
                `added_at` datetime(6) NOT NULL,
                `cart_id` bigint NOT NULL,
                `product_id` bigint NOT NULL,
                `variant_id` bigint
            )
        """)
        print("Created WearUpBack_cartitem table")

        # Create ProductView table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `WearUpBack_productview` (
                `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                `viewed_at` datetime(6) NOT NULL,
                `session_id` varchar(100) NOT NULL,
                `product_id` bigint NOT NULL,
                `user_id` int
            )
        """)
        print("Created WearUpBack_productview table")

        # Add foreign key constraints
        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_address`
                ADD CONSTRAINT `WearUpBack_address_user_id_fk`
                FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
            """)
            print("Added FK constraint for address.user_id")
        except:
            print("FK constraint for address.user_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_cart`
                ADD CONSTRAINT `WearUpBack_cart_user_id_fk`
                FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
            """)
            print("Added FK constraint for cart.user_id")
        except:
            print("FK constraint for cart.user_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_order`
                ADD CONSTRAINT `WearUpBack_order_user_id_fk`
                FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
            """)
            print("Added FK constraint for order.user_id")
        except:
            print("FK constraint for order.user_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_order`
                ADD CONSTRAINT `WearUpBack_order_billing_address_id_fk`
                FOREIGN KEY (`billing_address_id`) REFERENCES `WearUpBack_address` (`id`)
            """)
            print("Added FK constraint for order.billing_address_id")
        except:
            print("FK constraint for order.billing_address_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_order`
                ADD CONSTRAINT `WearUpBack_order_shipping_address_id_fk`
                FOREIGN KEY (`shipping_address_id`) REFERENCES `WearUpBack_address` (`id`)
            """)
            print("Added FK constraint for order.shipping_address_id")
        except:
            print("FK constraint for order.shipping_address_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_orderitem`
                ADD CONSTRAINT `WearUpBack_orderitem_order_id_fk`
                FOREIGN KEY (`order_id`) REFERENCES `WearUpBack_order` (`id`)
            """)
            print("Added FK constraint for orderitem.order_id")
        except:
            print("FK constraint for orderitem.order_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_orderitem`
                ADD CONSTRAINT `WearUpBack_orderitem_product_id_fk`
                FOREIGN KEY (`product_id`) REFERENCES `WearUpBack_product` (`id`)
            """)
            print("Added FK constraint for orderitem.product_id")
        except:
            print("FK constraint for orderitem.product_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_orderitem`
                ADD CONSTRAINT `WearUpBack_orderitem_variant_id_fk`
                FOREIGN KEY (`variant_id`) REFERENCES `WearUpBack_productvariant` (`id`)
            """)
            print("Added FK constraint for orderitem.variant_id")
        except:
            print("FK constraint for orderitem.variant_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_cartitem`
                ADD CONSTRAINT `WearUpBack_cartitem_cart_id_fk`
                FOREIGN KEY (`cart_id`) REFERENCES `WearUpBack_cart` (`id`)
            """)
            print("Added FK constraint for cartitem.cart_id")
        except:
            print("FK constraint for cartitem.cart_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_cartitem`
                ADD CONSTRAINT `WearUpBack_cartitem_product_id_fk`
                FOREIGN KEY (`product_id`) REFERENCES `WearUpBack_product` (`id`)
            """)
            print("Added FK constraint for cartitem.product_id")
        except:
            print("FK constraint for cartitem.product_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_cartitem`
                ADD CONSTRAINT `WearUpBack_cartitem_variant_id_fk`
                FOREIGN KEY (`variant_id`) REFERENCES `WearUpBack_productvariant` (`id`)
            """)
            print("Added FK constraint for cartitem.variant_id")
        except:
            print("FK constraint for cartitem.variant_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_productview`
                ADD CONSTRAINT `WearUpBack_productview_product_id_fk`
                FOREIGN KEY (`product_id`) REFERENCES `WearUpBack_product` (`id`)
            """)
            print("Added FK constraint for productview.product_id")
        except:
            print("FK constraint for productview.product_id already exists or failed")

        try:
            cursor.execute("""
                ALTER TABLE `WearUpBack_productview`
                ADD CONSTRAINT `WearUpBack_productview_user_id_fk`
                FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
            """)
            print("Added FK constraint for productview.user_id")
        except:
            print("FK constraint for productview.user_id already exists or failed")

        connection.commit()
        print("All tables created successfully!")

finally:
    connection.close()
