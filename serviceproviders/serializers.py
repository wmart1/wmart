from rest_framework import serializers

from payments.serializers import AccountSerializer

from .models import ServiceProvider


class ServiceProviderSerializer(serializers.ModelSerializer):
    """
    A data representation of a ServiceProvider
    """
    account = AccountSerializer(required=False)

    class Meta:
        model = ServiceProvider
        fields = '__all__'
