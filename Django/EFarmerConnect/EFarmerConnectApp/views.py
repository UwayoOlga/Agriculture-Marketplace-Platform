from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework import status, viewsets, generics, filters
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q, Sum
from django.utils import timezone
from django.db import transaction
from .models import (
    Product, User, Category, ProductImage, Cart, CartItem,
    Order, OrderItem, Payment, Review, ForumPost, Comment,
    WeatherAlert, AgronomicAdvice, MarketPrice, 
    DeliveryLogistics, Notification, SMSNotification
)
from .models_season import CropCalendar
from .serializers import (
    ProductSerializer, UserSerializer, CustomTokenObtainPairSerializer,
    UserUpdateSerializer, ChangePasswordSerializer, CategorySerializer,
    ProductImageSerializer, CartSerializer, CartItemSerializer,
    OrderSerializer, OrderItemSerializer, PaymentSerializer,
    ReviewSerializer, ForumPostSerializer, CommentSerializer,
    WeatherAlertSerializer, AgronomicAdviceSerializer,
    MarketPriceSerializer, DeliveryLogisticsSerializer, 
    NotificationSerializer, SMSNotificationSerializer, 
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)
from .serializers_season import CropCalendarSerializer
from .payment import get_payment_provider, PaymentException
import uuid
from django.utils import timezone as dj_timezone
from django.db.models import Prefetch
from io import BytesIO
from datetime import datetime, timedelta
from decimal import Decimal
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

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


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data.get('email')
        username = serializer.validated_data.get('username')

        try:
            if email:
                user = User.objects.get(email=email)
            else:
                user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Do not reveal whether the user exists
            return Response({'detail': 'If an account exists, a reset token has been generated.'}, status=status.HTTP_200_OK)

        from .models import PasswordResetToken

        token = uuid.uuid4().hex
        PasswordResetToken.objects.create(user=user, token=token)

        # In a real system, send via email/SMS. For now, return token in response for testing.
        return Response({'detail': 'Password reset token generated.', 'token': token}, status=status.HTTP_201_CREATED)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        from .models import PasswordResetToken

        token_value = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            token = PasswordResetToken.objects.get(token=token_value, is_used=False)
        except PasswordResetToken.DoesNotExist:
            return Response({'detail': 'Invalid or used token.'}, status=status.HTTP_400_BAD_REQUEST)

        # Optional: expire tokens after e.g. 1 day
        if token.created_at < dj_timezone.now() - dj_timezone.timedelta(days=1):
            return Response({'detail': 'Token has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user = token.user
        user.set_password(new_password)
        user.save()

        token.is_used = True
        token.save()

        return Response({'detail': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)

# List all products
class ProductListView(APIView):
    permission_classes = [AllowAny]  # Allow both authenticated and unauthenticated users
    
    def get(self, request):
        products = Product.objects.all()

        # Filters
        category_id = request.query_params.get('category')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        location = request.query_params.get('location')
        is_organic = request.query_params.get('is_organic')
        farmer_id = request.query_params.get('farmer')

        if category_id:
            products = products.filter(category_id=category_id)
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)
        if location:
            products = products.filter(farm_location__icontains=location)
        if farmer_id:
            if farmer_id == 'me':
                if request.user.is_authenticated:
                    products = products.filter(farmer=request.user)
                else:
                    return Response({"error": "Authentication required for 'me' filter."}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                try:
                    farmer_id_int = int(farmer_id)
                    products = products.filter(farmer_id=farmer_id_int)
                except (ValueError, TypeError):
                    pass
        if is_organic is not None:
            if is_organic.lower() in ['1', 'true', 'yes']:
                products = products.filter(is_organic=True)
            elif is_organic.lower() in ['0', 'false', 'no']:
                products = products.filter(is_organic=False)

        # Ordering
        ordering = request.query_params.get('ordering')
        if ordering:
            allowed_ordering = ['name', '-name', 'price', '-price', 'created_at', '-created_at', 'rating', '-rating']
            if ordering in allowed_ordering:
                products = products.order_by(ordering)

        # Pagination
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

# Add a new product
class ProductCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Only farmers can create products
        if getattr(request.user, 'user_type', None) != 'FARMER':
            return Response({'error': 'Only farmers can create products.'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save(farmer=request.user)
            
            # Handle image uploads
            images = request.FILES.getlist('images')
            for idx, image in enumerate(images):
                is_primary = idx == 0  # First image is primary
                ProductImage.objects.create(
                    product=product,
                    image=image,
                    is_primary=is_primary
                )
            
            # Return updated product with images
            updated_serializer = ProductSerializer(product, context={'request': request})
            return Response(updated_serializer.data, status=201)
        return Response(serializer.errors, status=400)


# View product details
class ProductDetailView(APIView):
    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            serializer = ProductSerializer(product, context={'request': request})
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
            serializer = ProductSerializer(product, data=request.data, context={'request': request})
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

        # Reuse same filters as list view
        category_id = request.query_params.get('category')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        location = request.query_params.get('location')
        is_organic = request.query_params.get('is_organic')
        farmer_id = request.query_params.get('farmer')

        if category_id:
            products = products.filter(category_id=category_id)
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)
        if location:
            products = products.filter(farm_location__icontains=location)
        if farmer_id:
            if farmer_id == 'me' and request.user.is_authenticated:
                products = products.filter(farmer=request.user)
            else:
                try:
                    farmer_id_int = int(farmer_id)
                    products = products.filter(farmer_id=farmer_id_int)
                except (ValueError, TypeError):
                    pass
        if is_organic is not None:
            if is_organic.lower() in ['1', 'true', 'yes']:
                products = products.filter(is_organic=True)
            elif is_organic.lower() in ['0', 'false', 'no']:
                products = products.filter(is_organic=False)

        # Ordering
        ordering = request.query_params.get('ordering')
        if ordering:
            allowed_ordering = ['name', '-name', 'price', '-price', 'created_at', '-created_at', 'rating', '-rating']
            if ordering in allowed_ordering:
                products = products.order_by(ordering)

        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

# Category Views
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access to view categories

# Cart Management
class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'user_type', None) != 'BUYER':
            return Response({'error': 'Only buyers have a shopping cart.'}, status=status.HTTP_403_FORBIDDEN)
        cart, created = Cart.objects.get_or_create(buyer=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if getattr(request.user, 'user_type', None) != 'BUYER':
            return Response({'error': 'Only buyers can add items to a cart.'}, status=status.HTTP_403_FORBIDDEN)
        cart, created = Cart.objects.get_or_create(buyer=request.user)
        serializer = CartItemSerializer(data={**request.data, 'cart': cart.id}, context={'request': request})
        if serializer.is_valid():
            cart_item = serializer.save()
            
            # Create CartRequest for farmer approval
            from .models import CartRequest
            CartRequest.objects.create(
                buyer=request.user,
                product=cart_item.product,
                quantity=cart_item.quantity
            )
            
            # Notify Farmer that their product was added to a cart
            try:
                Notification.objects.create(
                    user=cart_item.product.farmer,
                    type='ORDER',
                    title='New Cart Request',
                    message=f"{request.user.username} wants to buy {cart_item.quantity}x {cart_item.product.name}. Please review in 'View Orders'."
                )
            except Exception:
                pass

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
        serializer = OrderSerializer(orders, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if getattr(request.user, 'user_type', None) != 'BUYER':
            return Response({'error': 'Only buyers can place orders.'}, status=status.HTTP_403_FORBIDDEN)

        # Support creating order from payload items (for frontend localStorage cart)
        items_payload = request.data.get('items')
        cart_items = []
        should_clear_db_cart = False

        if items_payload:
            for item in items_payload:
                product_id = item.get('product_id') or item.get('id')
                quantity = item.get('quantity')
                
                if not product_id or not quantity:
                    continue
                    
                try:
                    product = Product.objects.get(pk=product_id)
                    # Create a simple object to mimic CartItem structure
                    class TempCartItem:
                        def __init__(self, product, quantity):
                            self.product = product
                            self.quantity = int(quantity)
                    cart_items.append(TempCartItem(product, quantity))
                except Product.DoesNotExist:
                    return Response({'error': f'Product with ID {product_id} not found.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Fallback to database cart
            cart, _ = Cart.objects.get_or_create(buyer=request.user)
            cart_items = list(cart.cartitem_set.select_related('product').all())
            should_clear_db_cart = True

        if not cart_items:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate stock availability (but don't deduct yet - wait for farmer approval)
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

        # Create order with PENDING_APPROVAL status
        order_data = {
            **request.data,
            'buyer': request.user.id,
            'total_amount': total_amount,
            'status': 'PENDING_APPROVAL'  # Waiting for farmer approval
        }
        
        serializer = OrderSerializer(data=order_data)
        if serializer.is_valid():
            order = serializer.save()

            # Create order items (but don't deduct stock yet - wait for approval)
            farmers = set()  # Track farmers to notify
            for cart_item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price_at_time=cart_item.product.price,
                )
                # Track the farmer for this product
                farmers.add(cart_item.product.farmer)
                # DON'T deduct stock yet - wait for farmer approval

            # Clear the cart if using DB cart
            if should_clear_db_cart:
                cart.cartitem_set.all().delete()
            
            # Notify farmer(s) about new order request
            for farmer in farmers:
                if farmer:  # Check farmer exists
                    Notification.objects.create(
                        user=farmer,
                        type='ORDER',
                        title=f'New Order Request #{order.id}',
                        message=f'{request.user.username} has placed an order request. Please review and approve or reject.'
                    )
            
            # Notify buyer that order was created and is pending approval
            Notification.objects.create(
                user=request.user,
                type='ORDER',
                title=f'Order Request #{order.id} Submitted',
                message='Your order request has been sent to the farmer. You will be notified once it is reviewed.',
            )

            return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Farmer-facing order management
class FarmerOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'user_type', None) != 'FARMER':
            return Response({'error': 'Only farmers can view incoming orders.'}, status=status.HTTP_403_FORBIDDEN)

        # Orders that include at least one item belonging to this farmer
        orders = (
            Order.objects
            .filter(items__product__farmer=request.user)
            .prefetch_related(
                Prefetch(
                    'items',
                    queryset=OrderItem.objects.select_related('product', 'product__farmer'),
                )
            )
            .select_related('buyer')
            .distinct()
            .order_by('-order_date')
        )

        payload = []
        for order in orders:
            # Filter items to only those belonging to this farmer
            farmer_items = [item for item in order.items.all() if item.product.farmer_id == request.user.id]
            item_data = OrderItemSerializer(farmer_items, many=True, context={'request': request}).data
            payload.append({
                'id': order.id,
                'order_date': order.order_date,
                'status': order.status,
                'shipping_address': order.shipping_address,
                'delivery_notes': order.delivery_notes,
                'total_amount': order.total_amount,
                'buyer': {
                    'id': order.buyer_id,
                    'username': getattr(order.buyer, 'username', None),
                    'phone_number': getattr(order.buyer, 'phone_number', None),
                },
                'items': item_data,
            })

        return Response(payload, status=status.HTTP_200_OK)


class FarmerOrderStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):
        if getattr(request.user, 'user_type', None) != 'FARMER':
            return Response({'error': 'Only farmers can manage incoming orders.'}, status=status.HTTP_403_FORBIDDEN)

        # Ensure the order contains at least one item from this farmer
        try:
            # For simplicity in this multi-vendor setup, allowing any involved farmer to act on the order
            # In a real system, we might split sub-orders per farmer.
            order = Order.objects.filter(items__product__farmer=request.user).distinct().get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found for this farmer.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # 'approve' or 'reject'
        rejection_reason = request.data.get('rejection_reason')

        if action == 'approve':
            if order.status != 'PENDING_APPROVAL':
                return Response({'error': 'Order is not pending approval.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate and deduct stock on approval
            for item in order.items.all():
                product = item.product
                if product.stock is None or product.stock < item.quantity:
                    return Response({
                        'error': f'Insufficient stock for {product.name}. Available: {product.stock}, Requested: {item.quantity}',
                        'product_id': product.id,
                        'available_stock': product.stock,
                        'requested_quantity': item.quantity
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Deduct stock on approval
                product.stock -= item.quantity
                product.save()
            
            order.status = 'PENDING_PAYMENT'
            order.save()
            
            Notification.objects.create(
                user=order.buyer,
                type='ORDER',
                title=f'Order #{order.id} Approved!',
                message='Your order has been approved by the farmer. Please proceed to payment.',
            )
            return Response({'detail': 'Order approved.', 'status': order.status})

        elif action == 'reject':
            if order.status not in ['PENDING_APPROVAL']:
                 return Response({'error': 'Can only reject orders pending approval.'}, status=status.HTTP_400_BAD_REQUEST)
            
            order.status = 'REJECTED'
            order.rejection_reason = rejection_reason or 'Rejected by farmer'
            order.save()

            # No need to restore stock since we never deducted it in the first place
            
            Notification.objects.create(
                user=order.buyer,
                type='ORDER',
                title=f'Order #{order.id} Rejected',
                message=rejection_reason or 'The farmer has rejected your order request.',
            )
            return Response({'detail': 'Order rejected.', 'status': order.status})

        else:
            return Response({'error': 'Invalid action. Use "accept" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)

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
                
                # Generate receipt URL
                receipt_url = f'/api/orders/{order.id}/receipt/'
                
                Notification.objects.create(
                    user=request.user,
                    type='PAYMENT',
                    title=f'Payment received for Order #{order.id}',
                    message=f'Your payment of RWF {amount:,.0f} has been received. Download your receipt here: {receipt_url}',
                )
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
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        posts = ForumPost.objects.all().order_by('-created_at')
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(posts, request)
        serializer = ForumPostSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = ForumPostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ForumPostDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        post = get_object_or_404(ForumPost, id=pk)
        if post.author != request.user:
            return Response({'error': 'You can only delete your own posts'}, status=status.HTTP_403_FORBIDDEN)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(ForumPost, id=post_id)
        serializer = CommentSerializer(data={**request.data, 'author': request.user.id, 'post': post_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def get(self, request, post_id):
        comments = Comment.objects.filter(post_id=post_id).order_by('created_at')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

class LikePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(ForumPost, id=post_id)
        user = request.user
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True
        return Response({'liked': liked, 'likes_count': post.likes.count()})
# Agricultural Features
class WeatherAlertView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = WeatherAlertSerializer(data=request.data)
        if serializer.is_valid():
            alert = serializer.save()
            # Notify all users about new weather alert
            for user in User.objects.all():
                Notification.objects.create(
                    user=user,
                    type='WEATHER',
                    title=alert.title,
                    message=f"New weather alert: {alert.description}",
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AgronomicAdviceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        advice = AgronomicAdvice.objects.all().order_by('-created_at')
        
        # Filtering
        district = request.query_params.get('district')
        season = request.query_params.get('season')
        risk_level = request.query_params.get('risk_level')
        target_crop = request.query_params.get('target_crop')
        
        if district:
            # Advice tailored for a specific district OR general advice (district is null or blank)
            # Or strict filtering based on requirements. Let's do partial match or strict.
            # Assuming simple partial match for now or strict equality.
            advice = advice.filter(Q(district__icontains=district) | Q(district__isnull=True) | Q(district=''))
        
        if season and season != 'ALL':
            advice = advice.filter(Q(season=season) | Q(season='ALL'))
            
        if risk_level:
            advice = advice.filter(risk_level=risk_level)
            
        if target_crop:
            advice = advice.filter(target_crop__icontains=target_crop)
            
        serializer = AgronomicAdviceSerializer(advice, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Only staff can post agronomic advice"}, 
                          status=status.HTTP_403_FORBIDDEN)
        serializer = AgronomicAdviceSerializer(data={**request.data, 'author': request.user.id})
        if serializer.is_valid():
            advice = serializer.save()
            for user in User.objects.all():
                Notification.objects.create(
                    user=user,
                    type='ADVICE',
                    title=advice.title,
                    message='New agronomic advice has been published.',
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# CropCalendarView has been moved to views_season.py

# Market Information
class MarketPriceView(APIView):
    def get(self, request):
        prices = MarketPrice.objects.all()

        # Optional filters: by product_category, market_location, date range
        category_id = request.query_params.get('category')
        market_location = request.query_params.get('market_location')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if category_id:
            prices = prices.filter(product_category_id=category_id)
        if market_location:
            prices = prices.filter(market_location__icontains=market_location)
        if date_from:
            prices = prices.filter(date__gte=date_from)
        if date_to:
            prices = prices.filter(date__lte=date_to)

        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(prices, request)
        serializer = MarketPriceSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Only staff can post market prices"}, 
                          status=status.HTTP_403_FORBIDDEN)
        serializer = MarketPriceSerializer(data=request.data)
        if serializer.is_valid():
            price = serializer.save()
            for user in User.objects.all():
                Notification.objects.create(
                    user=user,
                    type='PRICE',
                    title=f'Market price update for {price.product_category.name}',
                    message=f"New price at {price.market_location}: {price.price}",
                )
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
    
    def patch(self, request, notification_id=None):
        """Mark notification(s) as read"""
        if notification_id:
            # Mark single notification as read
            notification = get_object_or_404(Notification, id=notification_id, user=request.user)
            notification.is_read = request.data.get('is_read', True)
            notification.save()
            serializer = NotificationSerializer(notification)
            return Response(serializer.data)
        else:
            # Mark all notifications as read
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            return Response({'detail': 'All notifications marked as read'})


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


# Sales Report PDF for Farmers
class SalesReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Only farmers and admins can generate reports
            user_type = getattr(request.user, 'user_type', None)
            if user_type not in ['FARMER', 'ADMIN']:
                return Response({'error': 'Only farmers and admins can generate sales reports.'}, status=status.HTTP_403_FORBIDDEN)

            # Accept optional start_date and end_date as YYYY-MM-DD
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')

            try:
                if start_date_str:
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                else:
                    start_date = (datetime.utcnow() - timedelta(days=30)).date()
                if end_date_str:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                else:
                    end_date = datetime.utcnow().date()
            except (ValueError, TypeError):
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

            # Query order items
            from django.db.models import Sum, F
            
            items = OrderItem.objects.filter(
                order__order_date__date__gte=start_date,
                order__order_date__date__lte=end_date,
                order__status__in=['PAID', 'DELIVERED'] # Consider only completed sales
            )

            # Filter by farmer if user is a farmer
            if user_type == 'FARMER':
                items = items.filter(product__farmer=request.user)

            items = items.select_related('order', 'product').order_by('order__order_date')

            # Calculate total using database aggregation for efficiency
            total_sales = items.aggregate(
                total=Sum(F('quantity') * F('price_at_time'))
            )['total'] or Decimal('0.00')

            # Build table rows
            rows = []
            for it in items:
                order_date = it.order.order_date.date().isoformat()
                order_id = it.order.id
                product_name = it.product.name or 'Unnamed'
                qty = it.quantity
                unit_price = it.price_at_time
                subtotal = Decimal(qty) * unit_price
                rows.append([order_date, str(order_id), product_name, str(qty), f"{unit_price:.2f}", f"{subtotal:.2f}"])

            # Prepare PDF
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            styles = getSampleStyleSheet()
            elements = []

            title = Paragraph(f"Sales Report for {request.user.username}", styles['Title'])
            period = Paragraph(f"Period: {start_date.isoformat()} to {end_date.isoformat()}", styles['Normal'])
            elements.append(title)
            elements.append(Spacer(1, 12))
            elements.append(period)
            elements.append(Spacer(1, 12))

            if rows:
                table_data = [["Date", "Order #", "Product", "Qty", "Unit Price", "Subtotal"]] + rows
            else:
                table_data = [["Message"], ["No sales found for the selected period."]]

            table = Table(table_data, repeatRows=1)
            table_style = TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2e7d32')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('ALIGN', (3, 0), (4, -1), 'RIGHT'),
            ])
            table.setStyle(table_style)
            elements.append(table)
            elements.append(Spacer(1, 12))

            total_paragraph = Paragraph(f"<b>Total sales: RWF {total_sales:.2f}</b>", styles['Heading2'])
            elements.append(total_paragraph)

            # Build PDF
            doc.build(elements)
            buffer.seek(0)

            filename = f"sales_report_{request.user.username}_{start_date.isoformat()}_{end_date.isoformat()}.pdf"
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        except Exception as e:
            # Keep error handling but log it properly or return a DRF error response for non-PDF errors
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Cart Request Management (Pre-approval system)
class FarmerCartRequestsView(APIView):
    """
    Farmer view to see all pending cart requests for their products.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if getattr(request.user, 'user_type', None) != 'FARMER':
            return Response({'error': 'Only farmers can view cart requests.'}, status=status.HTTP_403_FORBIDDEN)
        
        from .models import CartRequest
        from .serializers import CartRequestSerializer
        
        # Get all cart requests for this farmer's products
        requests = CartRequest.objects.filter(
            product__farmer=request.user
        ).select_related('buyer', 'product').order_by('-created_at')
        
        serializer = CartRequestSerializer(requests, many=True)
        return Response(serializer.data)

class FarmerCartRequestActionView(APIView):
    """
    Farmer action to approve or reject a cart request.
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, request_id):
        if getattr(request.user, 'user_type', None) != 'FARMER':
            return Response({'error': 'Only farmers can manage order requests.'}, status=status.HTTP_403_FORBIDDEN)
        
        from .models import CartRequest
        
        cart_request = get_object_or_404(
            CartRequest, 
            id=request_id, 
            product__farmer=request.user
        )
        
        action = request.data.get('action')  # 'approve' or 'reject'
        
        if action == 'approve':
            cart_request.status = 'APPROVED'
            cart_request.reviewed_at = timezone.now()
            cart_request.save()
            
            # Notify buyer
            Notification.objects.create(
                user=cart_request.buyer,
                type='ORDER',
                title='Order Request Approved',
                message=f'Your order request for {cart_request.product.name} has been approved! You can now proceed to checkout.'
            )
            
            return Response({'detail': 'Order request approved.', 'status': cart_request.status})
            
        elif action == 'reject':
            cart_request.status = 'REJECTED'
            cart_request.rejection_reason = request.data.get('reason', '')
            cart_request.reviewed_at = timezone.now()
            cart_request.save()
            
            # Notify buyer
            Notification.objects.create(
                user=cart_request.buyer,
                type='ORDER',
                title='Order Request Rejected',
                message=f'Your order request for {cart_request.product.name} was rejected. Reason: {cart_request.rejection_reason or "Not specified"}'
            )
            
            return Response({'detail': 'Order request rejected.', 'status': cart_request.status})
        
        else:
            return Response({'error': 'Invalid action. Use "approve" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)

# Receipt Generation
class ReceiptView(APIView):
    """
    Generate PDF receipt for a paid order.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, order_id):
        # Get order and verify it belongs to the user and is paid
        order = get_object_or_404(Order, id=order_id, buyer=request.user, status='PAID')
        
        # Get payment details
        payment = Payment.objects.filter(order=order, status='COMPLETED').first()
        
        # Create PDF
        from io import BytesIO
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2e7d32'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        elements.append(Paragraph("E-FARMER CONNECT", title_style))
        elements.append(Paragraph("PAYMENT RECEIPT", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        # Receipt Info
        receipt_info = [
            ['Receipt #:', f'RCT-{order.id}-{payment.id if payment else "N/A"}'],
            ['Order #:', str(order.id)],
            ['Date:', order.order_date.strftime('%Y-%m-%d %H:%M')],
            ['Payment Date:', payment.payment_date.strftime('%Y-%m-%d %H:%M') if payment else 'N/A'],
            ['Payment Method:', payment.payment_method if payment else 'N/A'],
            ['Transaction ID:', payment.transaction_id if payment else 'N/A'],
        ]
        
        info_table = Table(receipt_info, colWidths=[2*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 20))
        
        # Buyer Info
        elements.append(Paragraph("BUYER INFORMATION", styles['Heading3']))
        buyer_info = [
            ['Name:', order.buyer.username],
            ['Email:', order.buyer.email],
            ['Phone:', order.buyer.phone_number or 'N/A'],
            ['Address:', order.shipping_address or 'N/A'],
        ]
        buyer_table = Table(buyer_info, colWidths=[2*inch, 4*inch])
        buyer_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(buyer_table)
        elements.append(Spacer(1, 20))
        
        # Items Table
        elements.append(Paragraph("ORDER ITEMS", styles['Heading3']))
        items_data = [['Item', 'Quantity', 'Unit Price', 'Total']]
        
        for item in order.items.all():
            items_data.append([
                item.product.name,
                str(item.quantity),
                f'RWF {item.price_at_time:,.0f}',
                f'RWF {item.price_at_time * item.quantity:,.0f}'
            ])
        
        items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2e7d32')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 20))
        
        # Total
        total_data = [
            ['Subtotal:', f'RWF {order.total_amount:,.0f}'],
            ['Delivery Fee:', 'FREE'],
            ['TOTAL PAID:', f'RWF {order.total_amount:,.0f}'],
        ]
        total_table = Table(total_data, colWidths=[5*inch, 2*inch])
        total_table.setStyle(TableStyle([
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
            ('TOPPADDING', (0, -1), (-1, -1), 12),
        ]))
        elements.append(total_table)
        elements.append(Spacer(1, 30))
        
        # Footer
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        elements.append(Paragraph("Thank you for your purchase!", footer_style))
        elements.append(Paragraph("E-Farmer Connect - Connecting Farmers and Buyers", footer_style))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        filename = f"receipt_order_{order.id}.pdf"
        from django.http import HttpResponse
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response



# Admin Dashboard Stats
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'user_type', None) != 'ADMIN':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        sixty_days_ago = now - timedelta(days=60)

        # Helper to calculate trend
        def calculate_trend(current_count, previous_count):
            if previous_count == 0:
                return "+100%" if current_count > 0 else "0%"
            change = ((current_count - previous_count) / previous_count) * 100
            return f"{'+' if change > 0 else ''}{int(change)}%"

        # Users
        total_users = User.objects.count()
        users_current_period = User.objects.filter(date_joined__gte=thirty_days_ago).count()
        users_prev_period = User.objects.filter(date_joined__gte=sixty_days_ago, date_joined__lt=thirty_days_ago).count()
        users_trend = calculate_trend(users_current_period, users_prev_period)

        # Orders
        total_orders = Order.objects.count()
        orders_current_period = Order.objects.filter(order_date__gte=thirty_days_ago).count()
        orders_prev_period = Order.objects.filter(order_date__gte=sixty_days_ago, order_date__lt=thirty_days_ago).count()
        orders_trend = calculate_trend(orders_current_period, orders_prev_period)

        # Revenue (Only PAID or COMPLETED)
        revenue_current = Order.objects.filter(status__in=['PAID', 'COMPLETED']).aggregate(total=Sum('total_amount'))['total'] or 0
        
        rev_current_period_sum = Order.objects.filter(
            status__in=['PAID', 'COMPLETED'], 
            order_date__gte=thirty_days_ago
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        rev_prev_period_sum = Order.objects.filter(
            status__in=['PAID', 'COMPLETED'], 
            order_date__gte=sixty_days_ago, 
            order_date__lt=thirty_days_ago
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        revenue_trend = calculate_trend(rev_current_period_sum, rev_prev_period_sum)

        # Pending Requests
        pending_requests = Order.objects.filter(status='PENDING_APPROVAL').count()
        # For pending, trend isn't time-based usually, but let's compare to last month's pending creation if possible?
        # Actually proper "pending" is a snapshot state. 
        # Let's just return a static helpful message or compare new pending requests vs last month.
        # Simplest: "Needs Attention" is hardcoded in frontend for now, but we can pass it if dynamic.
        
        recent_orders_qs = Order.objects.all().order_by('-order_date')[:5]
        recent_orders_data = []
        for order in recent_orders_qs:
            recent_orders_data.append({
                'id': order.id,
                'customer_name': order.buyer.get_full_name() or order.buyer.username,
                'date': order.order_date,
                'amount': order.total_amount,
                'status': order.status
            })

        return Response({
            'users': total_users,
            'users_trend': users_trend,
            'orders': total_orders,
            'orders_trend': orders_trend,
            'revenue': revenue_current,
            'revenue_trend': revenue_trend,
            'pending': pending_requests,
            'pending_trend': "Active",
            'recent_orders': recent_orders_data
        })

# Admin User Management
# Admin User Management
class AdminUserListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'id']
    filterset_fields = ['user_type', 'is_verified', 'is_active']
    ordering_fields = ['date_joined', 'last_login', 'username']
    ordering = ['-date_joined']

    def get_queryset(self):
        if self.request.user.user_type == 'ADMIN':
            return User.objects.all()
        return User.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'ADMIN':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        if self.request.user.user_type == 'ADMIN':
            return User.objects.all()
        return User.objects.none()

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except Exception as e:
            # If deletion fails (e.g. protected foreign keys), fall back to deactivation
            # Check if it is a ProtectedError
            if 'Constraint' in str(e) or 'Protected' in str(e) or 'Integrity' in str(e):
                 # Actually, better to just deactivate if we can't delete
                 # But standard DRF won't let us return a custom response easily from here without overriding destroy.
                 pass
            # Re-raise to let DRF handle it, or we override destroy() method instead of perform_destroy
            raise e

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            # Fallback: Soft delete if hard delete fails
            instance.is_active = False
            instance.save()
            return Response({'message': 'User could not be permanently deleted due to associated data. Account has been deactivated instead.'}, status=status.HTTP_200_OK)

class AdminUserActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.user_type != 'ADMIN':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, pk=pk)
        action = request.data.get('action')
        
        if action == 'suspend':
            user.is_active = False
            user.save()
            return Response({'status': 'User suspended'})
        elif action == 'activate':
            user.is_active = True
            user.save()
            return Response({'status': 'User activated'})
        elif action == 'verify':
            user.is_verified = True
            user.save()
            return Response({'status': 'User verified'})
        elif action == 'reset_password':
             # Generate a new random password
            new_password = User.objects.make_random_password()
            user.set_password(new_password)
            user.save()
            # In a real app, send email here
            return Response({'status': 'Password reset', 'new_password': new_password})
        elif action == 'change_role':
            new_role = request.data.get('role')
            if new_role not in ['ADMIN', 'FARMER', 'BUYER']:
                return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
            user.user_type = new_role
            user.save()
            return Response({'status': 'Role updated'})
            
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

# Admin Farmer List
class AdminFarmerListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        if self.request.user.user_type == 'ADMIN':
            return User.objects.filter(user_type='FARMER').order_by('-date_joined')
        return User.objects.none()

# Admin Product List and Management
class AdminProductListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        if self.request.user.user_type == 'ADMIN':
            return Product.objects.all().order_by('-created_at')
        return Product.objects.none()

# Admin Order List
class AdminOrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        if self.request.user.user_type == 'ADMIN':
            return Order.objects.all().order_by('-order_date')
        return Order.objects.none()


