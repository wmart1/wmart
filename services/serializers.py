from rest_framework import serializers

from .models import ExtraService


class ExtraServiceSerializer(serializers.ModelSerializer):
    """
    A data representation of an Extra Service
    """

    class Meta:
        model = ExtraService
        fields = '__all__'
