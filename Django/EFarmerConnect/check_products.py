import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EFarmerConnect.settings')
django.setup()

from EFarmerConnectApp.models import Product

count = Product.objects.count()
print(f"Product Count: {count}")
if count > 0:
    print("First 5 products:")
    for p in Product.objects.all()[:5]:
        print(f"- {p.name} (Farmer: {p.farmer.username}, Stock: {p.stock})")
else:
    print("No products found in database.")
