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
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
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
        cart, created = Cart.objects.get_or_create(buyer=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
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
        orders = Order.objects.filter(buyer=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        cart = Cart.objects.get(buyer=request.user)
        if not cart.cartitem_set.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OrderSerializer(data={**request.data, 'buyer': request.user.id})
        if serializer.is_valid():
            order = serializer.save()
            
            # Create order items from cart items
            for cart_item in cart.cartitem_set.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price_at_time=cart_item.product.price
                )
            
            # Clear the cart
            cart.cartitem_set.all().delete()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Payment Processing
class PaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, buyer=request.user)
        serializer = PaymentSerializer(data={**request.data, 'order': order.id})
        if serializer.is_valid():
            payment = serializer.save()
            order.status = 'paid'
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
