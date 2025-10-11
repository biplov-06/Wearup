import requests

response = requests.get('http://127.0.0.1:8000/api/products/')
if response.status_code == 200:
    data = response.json()
    if isinstance(data, list):
        products = data
    else:
        products = data.get('results', [])
    for product in products[:5]:  # First 5 products
        print(f"Product: {product.get('name')}")
        for img in product.get('images', []):
            print(f"  Image: {img.get('image')}")
else:
    print(f"Error: {response.status_code}")
