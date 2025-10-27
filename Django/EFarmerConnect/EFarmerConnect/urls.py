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
from EFarmerConnectApp.views import (
    ProductListView,
    ProductCreateView,
    ProductDetailView,
    ProductUpdateView,
    ProductDeleteView,
    ProductSearchView,
)

urlpatterns = [
    path('admin/', admin.site.urls),  # Admin site
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT token obtain
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT token refresh
    
    # Product-related endpoints
    path('api/products/', ProductListView.as_view(), name='product_list'),  # List all products
    path('api/products/create/', ProductCreateView.as_view(), name='product_create'),  # Create a product
    path('api/products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),  # Product detail by ID
    path('api/products/<int:pk>/update/', ProductUpdateView.as_view(), name='product_update'),  # Update product
    path('api/products/<int:pk>/delete/', ProductDeleteView.as_view(), name='product_delete'),  # Delete product
    path('api/products/search/', ProductSearchView.as_view(), name='product_search'),  # Search products
]

