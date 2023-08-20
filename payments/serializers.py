from rest_framework import serializers
from djstripe.models import Product, Price, Plan, Subscription, Account

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """
    A custom serializer to handle Order Payments
    """

    class Meta:
        model = Payment
        fields = '__all__'
        depth = 3


class SubscriptionSerializer(serializers.ModelSerializer):
    """
    A custom serializer to handle Stripe Plans
    """

    class Meta:
        model = Subscription
        fields = '__all__'
        depth = 3



class PlanSerializer(serializers.ModelSerializer):
    """
    A custom serializer to handle Stripe Plans
    """

    class Meta:
        model = Plan
        fields = '__all__'
        depth = 3


class PriceSerializer(serializers.ModelSerializer):
    """
    A serializer for the multiple prices per Stripe plan
    """
    class Meta:
        model = Price
        exclude = ('product',)


class ProductSerializer(serializers.ModelSerializer):
    """
    A serializer for the Stripe Plans
    """
    prices = PriceSerializer(many=True)

    class Meta:
        model = Product
        fields = '__all__'


class AccountSerializer(serializers.ModelSerializer):
    """
    A serializer for a service providers Stripe Account
    """
    class Meta:
        model = Account
        fields = '__all__'
