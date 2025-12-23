import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EFarmerConnect.settings')
django.setup()

from EFarmerConnectApp.models import Product, User, Category

# Ensure we have a farmer
farmer_username = 'farmer_test'
if not User.objects.filter(username=farmer_username).exists():
    farmer = User.objects.create_user(username=farmer_username, password='password123', email='farmer@test.com', user_type='FARMER')
    print(f"Created farmer: {farmer_username}")
else:
    farmer = User.objects.get(username=farmer_username)

# Ensure we have categories
categories = ['Vegetables', 'Fruits', 'Grains', 'Tubers']
cat_objs = []
for c in categories:
    cat, _ = Category.objects.get_or_create(name=c, defaults={'description': f'Fresh {c}'})
    cat_objs.append(cat)

# Create products
products_data = [
    {"name": "Fresh Carrots", "price": 500, "unit": "kg"},
    {"name": "Sweet Potatoes", "price": 300, "unit": "kg"},
    {"name": "Organic Spinach", "price": 800, "unit": "bunch"},
    {"name": "Yellow Maize", "price": 450, "unit": "kg"},
    {"name": "Avocados", "price": 200, "unit": "piece"},
]

count = 0
for p_data in products_data:
    if not Product.objects.filter(name=p_data['name']).exists():
        Product.objects.create(
            farmer=farmer,
            name=p_data['name'],
            description=f"High quality {p_data['name']} from our farm.",
            price=Decimal(p_data['price']),
            stock=100,
            category=random.choice(cat_objs),
            unit=p_data['unit'],
            farm_location="Kigali",
            is_organic=random.choice([True, False])
        )
        count += 1

print(f"Seeded {count} products.")
