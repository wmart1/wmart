from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    """
    A data representation of the Customer Profile
    """
    class Meta:
        model = Customer
        fields = '__all__'
