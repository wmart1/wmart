from rest_framework import serializers

from users.serializers import UserProfileSerializer
from .models import Dispute, Problem


class DisputeSerializer(serializers.ModelSerializer):
    """
    A data serialization of the dispute created by a customer
    """
    user = UserProfileSerializer(required=False)

    class Meta:
        model = Dispute
        fields = '__all__'


class ProblemSerializer(serializers.ModelSerializer):
    """
    A data serialization of the Report A Problem feature
    """
    user = UserProfileSerializer(required=False)

    class Meta:
        model = Problem
        fields = '__all__'
