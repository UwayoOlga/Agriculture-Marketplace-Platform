"""
URL configuration for E-Farmer Connect project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from EFarmerConnectApp.views import (
    ProductListView, ProductCreateView, ProductDetailView,
    ProductUpdateView, ProductDeleteView, ProductSearchView,
    RegisterView, CustomTokenObtainPairView, UserProfileView,
    ChangePasswordView, PasswordResetRequestView, PasswordResetConfirmView,
    CategoryViewSet, CartView, CartItemView,
    OrderView, PaymentView, ReviewView, ForumPostView,
    CommentView, WeatherAlertView, AgronomicAdviceView,
    CropCalendarView, MarketPriceView, DeliveryLogisticsView,
    NotificationView, SMSNotificationView
)
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions


schema_view = get_schema_view(
    openapi.Info(
        title="E-Farmer Connect API",
        default_version='v1',
        description="API documentation for E-Farmer Connect",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'api/categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('admin/', admin.site.urls),  # Admin site
    
    # Authentication endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('api/profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('api/password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('api/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Product-related endpoints
    path('api/products/', ProductListView.as_view(), name='product_list'),
    path('api/products/create/', ProductCreateView.as_view(), name='product_create'),
    path('api/products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('api/products/<int:pk>/update/', ProductUpdateView.as_view(), name='product_update'),
    path('api/products/<int:pk>/delete/', ProductDeleteView.as_view(), name='product_delete'),
    path('api/products/search/', ProductSearchView.as_view(), name='product_search'),
    path('api/products/<int:product_id>/reviews/', ReviewView.as_view(), name='product_reviews'),
    
    # Shopping Cart endpoints
    path('api/cart/', CartView.as_view(), name='cart'),
    path('api/cart/items/', CartItemView.as_view(), name='cart_items'),
    path('api/cart/items/<int:item_id>/', CartItemView.as_view(), name='cart_item_detail'),
    
    # Order Management endpoints
    path('api/orders/', OrderView.as_view(), name='orders'),
    path('api/orders/<int:order_id>/payment/', PaymentView.as_view(), name='order_payment'),
    path('api/orders/<int:order_id>/delivery/', DeliveryLogisticsView.as_view(), name='order_delivery'),
    
    # Community & Forum endpoints
    path('api/forum/posts/', ForumPostView.as_view(), name='forum_posts'),
    path('api/forum/posts/<int:post_id>/comments/', CommentView.as_view(), name='post_comments'),
    
    # Agricultural Features endpoints
    path('api/weather-alerts/', WeatherAlertView.as_view(), name='weather_alerts'),
    path('api/agronomic-advice/', AgronomicAdviceView.as_view(), name='agronomic_advice'),
    path('api/crop-calendar/', CropCalendarView.as_view(), name='crop_calendar'),
    path('api/market-prices/', MarketPriceView.as_view(), name='market_prices'),
    
    # Notification endpoints
    path('api/notifications/', NotificationView.as_view(), name='notifications'),
    path('api/notifications/sms/', SMSNotificationView.as_view(), name='sms_notifications'),
] + router.urls

# Swagger/OpenAPI
urlpatterns += [
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

