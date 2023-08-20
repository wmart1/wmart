from django.contrib.auth import get_user_model, authenticate
from django.db.models import Avg

from rest_framework import serializers
from customers.models import Customer
from customers.serializers import CustomerSerializer
from reviews.serializers import SubscriptionSerializer
from serviceproviders.models import ServiceProvider
from serviceproviders.serializers import ServiceProviderSerializer

from home.utility import verifyOTP

from users.models import User
from allauth.account.models import EmailAddress


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Custom serializer for creating a User
    """
    customer = CustomerSerializer(required=False)
    serviceprovider = ServiceProviderSerializer(required=False)
    is_admin = serializers.SerializerMethodField()
    subscribed = serializers.SerializerMethodField()
    subscription = SubscriptionSerializer(required=False)


    class Meta:
        model = get_user_model()
        fields = ('id', 'name', 
                  'email', 'password', 'type', 
                  'customer', 'serviceprovider', 
                  'is_admin', 'subscription', 'account', 'registration_id',
                  'subscribed')
        extra_kwargs = {'password': {'write_only': True, 'min_length': 5},
                        'email': {'required': True},
                        'type': {'required': True},
                        'name': {'required': False},
                        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.get('email')
        type = validated_data.get('type')
        validated_data['username'] = email
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        email_address, created = EmailAddress.objects.get_or_create(user=user, email=user.email, verified=True, primary=True)
        if type == 'Customer':
            Customer.objects.create(user=user)
        elif type == 'Service Provider':
            ServiceProvider.objects.create(user=user)
        return user

    def update(self, instance, validated_data):
        email = validated_data.get('email', None)
        if email:
            validated_data['username'] = email
        if 'customer' in validated_data:
            nested_serializer = self.fields['customer']
            nested_instance = instance.customer
            nested_data = validated_data.pop('customer')
            nested_serializer.update(nested_instance, nested_data)
        if 'serviceprovider' in validated_data:
            nested_serializer = self.fields['serviceprovider']
            nested_instance = instance.serviceprovider
            nested_data = validated_data.pop('serviceprovider')
            nested_serializer.update(nested_instance, nested_data)
        user = super().update(instance, validated_data)
        return user

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.type == 'Customer':
            rep.pop('serviceprovider', None)
            rep['rating'] = instance.customer_reviews.aggregate(Avg('rating'))['rating__avg']
        elif instance.type == 'Service Provider':
            rep.pop('customer', None)
            rep['rating'] = instance.reviews.aggregate(Avg('rating'))['rating__avg']
        return rep

    def get_is_admin(self, obj):
        return obj.is_superuser

    def get_subscribed(self, obj):
        subscription = None
        if obj.type == 'Service Provider':
            subscription = obj.subscription
        if subscription is not None:
            return subscription.status
        else:
            return None


class OTPSerializer(serializers.Serializer):
    """
    Custom serializer to verify an OTP and Activate a User
    """
    otp = serializers.CharField(max_length=4, required=True)
    email = serializers.CharField(required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'detail': 'Invalid Email'})
        else:
            if verifyOTP(otp=otp, activation_key=user.activation_key, user=user):
                user.is_active = True
                user.activation_key = ''
                user.otp = ''
                user.save()
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError({'detail': 'Invalid or Expired OTP, please try again'})


class ChangePasswordSerializer(serializers.Serializer):
    """
    Custom serializer used to set the password for a User
    """
    password_1 = serializers.CharField(
        min_length=4,
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password_2 = serializers.CharField(
        min_length=4,
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        pass1 = attrs.get('password_1')
        pass2 = attrs.get('password_2')
        if pass1 != pass2:
            raise serializers.ValidationError({'detail': 'Passwords do not match'})
        return super().validate(attrs)


class CustomAuthTokenSerializer(serializers.Serializer):
    """
    Serializer for returning an authenticated User and Token
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(style={'input_type': 'password'}, trim_whitespace=False, required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        user = authenticate(
            request=self.context.get('request'),
            email=email,
            password=password
        )
        if not user:
            raise serializers.ValidationError({'detail': 'Unable to authenticate with provided credentials'})
        attrs['user'] = user
        return attrs
