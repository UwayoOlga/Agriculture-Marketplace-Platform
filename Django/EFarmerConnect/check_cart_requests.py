import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EFarmerConnect.settings')
django.setup()

from EFarmerConnectApp.models import CartRequest, User, Product

print("=== Cart Requests in Database ===")
requests = CartRequest.objects.all()
print(f"Total CartRequests: {requests.count()}")

for req in requests:
    print(f"\nID: {req.id}")
    print(f"Buyer: {req.buyer.username}")
    print(f"Product: {req.product.name}")
    print(f"Quantity: {req.quantity}")
    print(f"Status: {req.status}")
    print(f"Created: {req.created_at}")

print("\n=== Recent Cart Items ===")
from EFarmerConnectApp.models import CartItem
cart_items = CartItem.objects.all().order_by('-id')[:5]
print(f"Total CartItems: {CartItem.objects.count()}")
for item in cart_items:
    print(f"CartItem ID: {item.id}, Product: {item.product.name}, Quantity: {item.quantity}")
