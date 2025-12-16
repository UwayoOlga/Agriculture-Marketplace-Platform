import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EFarmerConnect.settings')
django.setup()

from EFarmerConnectApp.models import Category

categories = [
    {"name": "Cereals", "description": "Grains like Maize, Rice, Sorghum, Wheat"},
    {"name": "Vegetables", "description": "Fresh produce like Tomatoes, Carrots, Onions, Spinach"},
    {"name": "Fruits", "description": "Fruits like Bananas, Pineapple, Passion Fruit, Mangoes, Avocados"},
    {"name": "Roots & Tubers", "description": "Potatoes, Cassava, Sweet Potatoes, Yams"},
    {"name": "Legumes", "description": "Beans, Peas, Groundnuts, Soybeans"},
    {"name": "Cash Crops", "description": "Coffee, Tea, Pyrethrum"},
    {"name": "Livestock", "description": "Dairy products, Meat, Eggs"},
    {"name": "Spices", "description": "Chili, Ginger, Garlic"}
]

for cat_data in categories:
    cat, created = Category.objects.get_or_create(
        name=cat_data["name"], 
        defaults={"description": cat_data["description"]}
    )
    if created:
        print(f"Created category: {cat.name}")
    else:
        print(f"Category already exists: {cat.name}")

print("Seeding complete.")
