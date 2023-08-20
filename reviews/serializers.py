from rest_framework import serializers

from .models import CustomerReview, Review

from djstripe.models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    """
    A custom serializer to handle Stripe Plans
    """

    class Meta:
        model = Subscription
        fields = '__all__'
        depth = 3


class ReviewSerializer(serializers.ModelSerializer):
    """
    A data representation of a Review left for a Service Provider
    """
    class Meta:
        model = Review
        fields = '__all__'


class CustomerReviewSerializer(serializers.ModelSerializer):
    """
    A data representation of a Review left for a Customer
    """
    class Meta:
        model = CustomerReview
        fields = '__all__'
        extra_kwargs = {
            'service_provider': {
                'required': False
            },
            'user': {
                'required': True
            }
        }
