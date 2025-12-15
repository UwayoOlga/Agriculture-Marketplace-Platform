from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    Product, User, Category, ProductImage, Cart, CartItem,
    Order, OrderItem, Payment, Review, ForumPost, Comment,
    WeatherAlert, AgronomicAdvice, MarketPrice, DeliveryLogistics, 
    Notification, SMSNotification, PasswordResetToken
)

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'is_primary', 'uploaded_at')

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    farmer_name = serializers.CharField(source='farmer.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    farmer_full_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Product
        fields = ('id', 'farmer', 'farmer_name', 'farmer_full_name', 'category', 'category_name', 'name', 
                 'description', 'price', 'stock', 'unit', 'harvest_date', 'expiry_date', 
                 'farm_location', 'farm_gps_coordinates', 'is_organic', 'images', 
                 'created_at', 'updated_at')

    def get_farmer_full_name(self, obj):
        if obj.farmer:
            full_name = f"{obj.farmer.first_name} {obj.farmer.last_name}".strip()
            return full_name if full_name else obj.farmer.username
        return "Unknown Farmer"

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 
                 'phone_number', 'address', 'user_type', 'is_verified')
        read_only_fields = ('is_verified',)

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['user_type'] = user.user_type
        return token

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone_number', 'address', 'gps_coordinates')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)

    def validate(self, attrs):
        if not attrs.get('email') and not attrs.get('username'):
            raise serializers.ValidationError('Provide either email or username.')
        return attrs


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = CartItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def get_items(self, obj):
        # Return all items for the order; callers can filter if needed
        qs = obj.items.select_related('product')
        return OrderItemSerializer(qs, many=True).data

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'

class ForumPostSerializer(serializers.ModelSerializer):
    author_details = UserSerializer(source='author', read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = ForumPost
        fields = ['id', 'author', 'author_details', 'title', 'content', 'image', 'created_at', 'updated_at', 'likes_count', 'is_liked', 'category']
        read_only_fields = ['author', 'created_at', 'updated_at', 'likes_count', 'is_liked']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

class CommentSerializer(serializers.ModelSerializer):
    author_details = UserSerializer(source='author', read_only=True)
    
    class Meta:
        model = Comment
        fields = '__all__'

class WeatherAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherAlert
        fields = '__all__'

class AgronomicAdviceSerializer(serializers.ModelSerializer):
    author_details = UserSerializer(source='author', read_only=True)
    
    class Meta:
        model = AgronomicAdvice
        fields = '__all__'

# CropCalendar serializer has been moved to serializers_season.py

class MarketPriceSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='product_category', read_only=True)
    
    class Meta:
        model = MarketPrice
        fields = '__all__'

class DeliveryLogisticsSerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='order', read_only=True)
    
    class Meta:
        model = DeliveryLogistics
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class SMSNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSNotification
        fields = '__all__'
