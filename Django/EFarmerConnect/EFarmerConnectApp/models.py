from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('FARMER', 'Farmer'),
        ('BUYER', 'Buyer'),
        ('ADMIN', 'Administrator'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, null=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    gps_coordinates = models.CharField(max_length=50, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True, null=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class Product(models.Model):
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'FARMER'}, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255, null=True)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    stock = models.IntegerField(null=True)
    unit = models.CharField(max_length=20, null=True)  # e.g., kg, tons, pieces
    harvest_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    farm_location = models.CharField(max_length=255, null=True, blank=True)
    farm_gps_coordinates = models.CharField(max_length=50, blank=True, null=True)
    is_organic = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} by {self.farmer.username}"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/')
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Cart(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'BUYER'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())
    
    def __str__(self):
        return f"Cart for {self.buyer.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    def get_subtotal(self):
        return self.product.price * self.quantity
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PENDING_CONFIRMATION', 'Pending Farmer Confirmation'),
        ('REJECTED', 'Rejected by Farmer'),
        ('CONFIRMED', 'Confirmed by Farmer'),
        ('AWAITING_PAYMENT', 'Awaiting Payment'),
        ('PAYMENT_PROCESSING', 'Payment Processing'),
        ('PAID', 'Payment Completed'),
        ('PREPARING', 'Preparing for Shipping'),
        ('SHIPPING', 'In Transit'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    )
    
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', limit_choices_to={'user_type': 'BUYER'}, null=True)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='PENDING')
    shipping_address = models.TextField(null=True, blank=True)
    delivery_notes = models.TextField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estimated_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Order #{self.id} by {self.buyer.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('MTN_MOMO', 'MTN Mobile Money'),
        ('AIRTEL_MONEY', 'Airtel Money'),
        ('TIGO_CASH', 'Tigo Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_proof = models.ImageField(upload_to='payment_proofs/', null=True, blank=True)
    phone_number = models.CharField(max_length=15, help_text='Mobile money phone number')
    failure_reason = models.TextField(blank=True, null=True)
    refund_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Payment {self.transaction_id} for Order #{self.order.id}"

class DeliveryLogistics(models.Model):
    STATUS_CHOICES = (
        ('ASSIGNED', 'Assigned to Driver'),
        ('PICKUP', 'Out for Pickup'),
        ('COLLECTED', 'Collected from Farmer'),
        ('INTRANSIT', 'In Transit'),
        ('DELIVERING', 'Out for Delivery'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Delivery Failed'),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='logistics')
    driver_name = models.CharField(max_length=100)
    driver_phone = models.CharField(max_length=15)
    vehicle_info = models.CharField(max_length=100)
    pickup_location = models.TextField()
    delivery_location = models.TextField()
    current_location = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    pickup_time = models.DateTimeField(null=True, blank=True)
    delivery_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    tracking_number = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return f"Delivery #{self.tracking_number} for Order #{self.order.id}"

class SMSNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=15)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20)
    delivery_status = models.CharField(max_length=20, null=True, blank=True)
    
    def __str__(self):
        return f"SMS to {self.phone_number} at {self.sent_at}"

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username} on {self.product.name}"

class WeatherAlert(models.Model):
    ALERT_TYPES = (
        ('RAIN', 'Heavy Rain'),
        ('DROUGHT', 'Drought Warning'),
        ('FROST', 'Frost Warning'),
        ('PEST', 'Pest Alert'),
        ('DISEASE', 'Disease Alert'),
    )
    
    title = models.CharField(max_length=200)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    description = models.TextField()
    affected_area = models.CharField(max_length=255)
    severity = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.affected_area}"

class AgronomicAdvice(models.Model):
    ADVICE_CATEGORIES = (
        ('CROP', 'Crop Management'),
        ('PEST', 'Pest Control'),
        ('SOIL', 'Soil Management'),
        ('WATER', 'Water Management'),
        ('MARKET', 'Market Intelligence'),
    )
    
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=ADVICE_CATEGORIES)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'ADMIN'})
    crops = models.ManyToManyField(Category, related_name='advice')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='advice_images/', blank=True, null=True)
    
    def __str__(self):
        return self.title

class CropCalendar(models.Model):
    SEASON_CHOICES = (
        ('A', 'Season A (Sept-Feb)'),
        ('B', 'Season B (March-July)'),
        ('C', 'Season C (Valley/Marshland)'),
    )
    
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'FARMER'})
    crop = models.ForeignKey(Category, on_delete=models.CASCADE)
    season = models.CharField(max_length=1, choices=SEASON_CHOICES)
    planting_date = models.DateField()
    expected_harvest_date = models.DateField()
    field_size = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.crop.name} - {self.get_season_display()}"

class MarketPrice(models.Model):
    product_category = models.ForeignKey(Category, on_delete=models.CASCADE)
    market_location = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    source = models.CharField(max_length=100)
    
    class Meta:
        unique_together = ('product_category', 'market_location', 'date')
    
    def __str__(self):
        return f"{self.product_category.name} - {self.market_location}"

class ForumPost(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='forum_posts')
    
    def __str__(self):
        return self.title

class Comment(models.Model):
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('ORDER', 'Order Update'),
        ('PAYMENT', 'Payment Update'),
        ('WEATHER', 'Weather Alert'),
        ('PRICE', 'Price Alert'),
        ('ADVICE', 'Agronomic Advice'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_type_display()} for {self.user.username}"
