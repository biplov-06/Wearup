import requests
import json

try:
    response = requests.get('http://127.0.0.1:8000/api/products/')
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data:
            product = data[0] if data else {}
            print("Sample product image URLs:")
            if 'images' in product:
                for img in product['images']:
                    print(f"  Image: {img.get('image', 'N/A')}")
            if 'image' in product:
                print(f"  Main image: {product['image']}")
            if 'seller' in product and product['seller']:
                print(f"  Seller avatar: {product['seller'].get('avatar', 'N/A')}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
