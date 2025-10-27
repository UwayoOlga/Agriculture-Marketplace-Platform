from rest_framework import serializers
from .models import Product  # Replace with your model

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'  # Adjust fields as necessary
