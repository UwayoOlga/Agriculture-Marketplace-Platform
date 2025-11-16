from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework import status, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q
from django.utils import timezone
from .models import (
    Product, User, Category, ProductImage, Cart, CartItem,
    Order, OrderItem, Payment, Review, ForumPost, Comment,
    WeatherAlert, AgronomicAdvice, CropCalendar, MarketPrice,
    DeliveryLogistics, Notification, SMSNotification
)
from .serializers import (
    ProductSerializer, UserSerializer, CustomTokenObtainPairSerializer,
    UserUpdateSerializer, ChangePasswordSerializer, CategorySerializer,
    ProductImageSerializer, CartSerializer, CartItemSerializer,
    OrderSerializer, OrderItemSerializer, PaymentSerializer,
    ReviewSerializer, ForumPostSerializer, CommentSerializer,
    WeatherAlertSerializer, AgronomicAdviceSerializer,
    CropCalendarSerializer, MarketPriceSerializer,
    DeliveryLogisticsSerializer, NotificationSerializer,
    SMSNotificationSerializer
)
from .payment import get_payment_provider, PaymentException

# Authentication and User Profile Views
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        old_password = serializer.validated_data.get('old_password')
        new_password = serializer.validated_data.get('new_password')

        if not request.user.check_password(old_password):
            return Response({'old_password': ['Incorrect password.']}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()
        return Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)

# List all products
class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

# Add a new product
class ProductCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Only farmers can create products
        if getattr(request.user, 'user_type', None) != 'FARMER':
            return Response({'error': 'Only farmers can create products.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(farmer=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# View product details
class ProductDetailView(APIView):
    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

# Update product details
class ProductUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            # Only the owning farmer (or admin) can update
            if product.farmer != request.user and not request.user.is_staff:
                return Response({'error': 'You are not allowed to update this product.'}, status=status.HTTP_403_FORBIDDEN)
            serializer = ProductSerializer(product, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

# Delete a product
class ProductDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            # Only the owning farmer (or admin) can delete
            if product.farmer != request.user and not request.user.is_staff:
                return Response({'error': 'You are not allowed to delete this product.'}, status=status.HTTP_403_FORBIDDEN)
            product.delete()
            return Response({'message': 'Product deleted successfully'}, status=204)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

# Search for products
class ProductSearchView(APIView):
    def get(self, request):
        query = request.GET.get('query', '')
        products = Product.objects.filter(Q(name__icontains=query) | Q(description__icontains=query))
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

# Category Views
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

# Cart Management
class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'user_type', None) != 'BUYER':
            return Response({'error': 'Only buyers have a shopping cart.'}, status=status.HTTP_403_FORBIDDEN)
        cart, created = Cart.objects.get_or_create(buyer=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if getattr(request.user, 'user_type', None) != 'BUYER':
            return Response({'error': 'Only buyers can add items to a cart.'}, status=status.HTTP_403_FORBIDDEN)
        cart, created = Cart.objects.get_or_create(buyer=request.user)
        serializer = CartItemSerializer(data={**request.data, 'cart': cart.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, item_id):
        item = get_object_or_404(CartItem, id=item_id, cart__buyer=request.user)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Order Management
class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'user_type', None) != 'BUYER':
            return Response({'error': 'Only buyers can view orders.'}, status=status.HTTP_403_FORBIDDEN)
        orders = Order.objects.filter(buyer=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        if getattr(request.user, 'user_type', None) != 'BUYER':
            return Response({'error': 'Only buyers can place orders.'}, status=status.HTTP_403_FORBIDDEN)

        cart = Cart.objects.get(buyer=request.user)
        cart_items = list(cart.cartitem_set.select_related('product').all())
        if not cart_items:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate stock and compute total
        total_amount = 0
        for item in cart_items:
            if item.product.stock is None or item.product.stock < item.quantity:
                return Response(
                    {
                        "error": f"Insufficient stock for product '{item.product.name}'.",
                        "product_id": item.product.id,
                        "available_stock": item.product.stock,
                        "requested_quantity": item.quantity,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            total_amount += float(item.product.price) * item.quantity

        serializer = OrderSerializer(data={**request.data, 'buyer': request.user.id, 'total_amount': total_amount})
        if serializer.is_valid():
            order = serializer.save()

            # Create order items and update stock
            for cart_item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price_at_time=cart_item.product.price,
                )
                cart_item.product.stock -= cart_item.quantity
                cart_item.product.save()

            # Clear the cart
            cart.cartitem_set.all().delete()

            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Payment Processing
class PaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, buyer=request.user)

        # Determine amount
        amount = request.data.get('amount') or order.total_amount or 0
        try:
            amount = float(amount)
        except Exception:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        phone_number = request.data.get('phone_number') or getattr(request.user, 'phone_number', None)
        payment_method = request.data.get('payment_method') or 'MTN_MOMO'

        provider = get_payment_provider()
        try:
            result = provider.charge(amount=amount, phone_number=phone_number, payment_method=payment_method)
        except PaymentException as e:
            # Record failed payment
            data = {
                'order': order.id,
                'amount': amount,
                'payment_method': payment_method,
                'transaction_id': f'failed_{order.id}_{timezone.now().timestamp()}',
                'status': 'FAILED',
                'phone_number': phone_number,
                'failure_reason': str(e),
            }
            serializer = PaymentSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
            return Response({'error': 'Payment provider error', 'details': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        # Success path
        transaction_id = result.get('transaction_id') or f'tx_{order.id}_{timezone.now().timestamp()}'
        status_str = 'COMPLETED' if result.get('status') in ('success', 'completed') else 'FAILED'

        data = {
            'order': order.id,
            'amount': amount,
            'payment_method': payment_method,
            'transaction_id': transaction_id,
            'status': status_str,
            'phone_number': phone_number,
        }

        serializer = PaymentSerializer(data=data)
        if serializer.is_valid():
            payment = serializer.save()
            if status_str == 'COMPLETED':
                order.status = 'PAID'
                order.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Reviews
class ReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        serializer = ReviewSerializer(data={**request.data, 'user': request.user.id, 'product': product_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Forum Management
class ForumPostView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = ForumPost.objects.all().order_by('-created_at')
        serializer = ForumPostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ForumPostSerializer(data={**request.data, 'author': request.user.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(ForumPost, id=post_id)
        serializer = CommentSerializer(data={**request.data, 'author': request.user.id, 'post': post_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Agricultural Features
class WeatherAlertView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = WeatherAlertSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AgronomicAdviceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        advice = AgronomicAdvice.objects.all().order_by('-created_at')
        serializer = AgronomicAdviceSerializer(advice, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Only staff can post agronomic advice"}, 
                          status=status.HTTP_403_FORBIDDEN)
        serializer = AgronomicAdviceSerializer(data={**request.data, 'author': request.user.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CropCalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        calendars = CropCalendar.objects.filter(farmer=request.user)
        serializer = CropCalendarSerializer(calendars, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CropCalendarSerializer(data={**request.data, 'farmer': request.user.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Market Information
class MarketPriceView(APIView):
    def get(self, request):
        prices = MarketPrice.objects.all()
        serializer = MarketPriceSerializer(prices, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Only staff can post market prices"}, 
                          status=status.HTTP_403_FORBIDDEN)
        serializer = MarketPriceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delivery Management
class DeliveryLogisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        delivery = get_object_or_404(DeliveryLogistics, order_id=order_id)
        serializer = DeliveryLogisticsSerializer(delivery)
        return Response(serializer.data)

    def post(self, request, order_id):
        if not request.user.is_staff:
            return Response({"error": "Only staff can manage deliveries"}, 
                          status=status.HTTP_403_FORBIDDEN)
        order = get_object_or_404(Order, id=order_id)
        serializer = DeliveryLogisticsSerializer(data={**request.data, 'order': order_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, order_id):
        if not request.user.is_staff:
            return Response({"error": "Only staff can update deliveries"}, 
                          status=status.HTTP_403_FORBIDDEN)
        delivery = get_object_or_404(DeliveryLogistics, order_id=order_id)
        serializer = DeliveryLogisticsSerializer(delivery, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Notifications
class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class SMSNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Only staff can send SMS notifications"}, 
                          status=status.HTTP_403_FORBIDDEN)
        serializer = SMSNotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
