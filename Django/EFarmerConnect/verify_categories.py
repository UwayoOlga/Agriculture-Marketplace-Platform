import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EFarmerConnect.settings')
django.setup()

from EFarmerConnectApp.models import Category

count = Category.objects.count()
print(f"Categories Count: {count}")
if count > 0:
    for cat in Category.objects.all():
        print(f" - {cat.name} (ID: {cat.id})")
else:
    print("NO CATEGORIES FOUND.")
