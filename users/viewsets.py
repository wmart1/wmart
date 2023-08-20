from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from allauth.account.models import EmailAddress
from django_filters.rest_framework import DjangoFilterBackend
from serviceproviders.models import ServiceProvider
from wash_and_fold_34887.settings import SECRET_KEY

from users.models import User
from users.authentication import ExpiringTokenAuthentication
from home.permissions import IsPostOrIsAuthenticated

from home.utility import auth_token, send_otp, send_password_reset_email
from users.serializers import ChangePasswordSerializer, CustomAuthTokenSerializer, OTPSerializer, UserProfileSerializer

from wash_and_fold_34887.settings import STRIPE_TEST_SECRET_KEY, CONNECTED_SECRET

import stripe
import djstripe
from djstripe import webhooks


stripe.api_key = STRIPE_TEST_SECRET_KEY


class UserViewSet(ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = (IsPostOrIsAuthenticated,)
    authentication_classes  = [ExpiringTokenAuthentication]
    queryset = User.objects.all()

    # Create User and return Token + Profile
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        token, created = Token.objects.get_or_create(user=serializer.instance)
        return Response({'token': token.key, 'user': serializer.data}, status=status.HTTP_201_CREATED, headers=headers) 

    # Update Profile
    def partial_update(self, request, *args, **kwargs):
        partial = True
        instance = request.user
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Send a OTP
    @action(detail=False, methods=['post'])
    def otp(self, request):
        try:
            email = request.data.get('email')
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            return Response({"detail": "Invalid Email - Does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        send_otp(user)
        return Response(status=status.HTTP_200_OK)

    # Verify OTP
    @action(detail=False, methods=['post'])
    def verify(self, request):
        serializer = OTPSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token = auth_token(user)
            serializer = UserProfileSerializer(user)
            return Response({'token': token.key, 'user': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Reset Password Email
    @action(detail=False, methods=['post'])
    def reset(self, request):
        email = request.data.get('email')
        try:
            email = request.data.get('email')
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            return Response({"detail": "Invalid Email - Does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        send_password_reset_email(user)
        return Response(status=status.HTTP_200_OK)

    # Set password
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['password_1'])
            user.save()
            return Response({'detail': "Password Updated Successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Login a User
    @action(detail=False, methods=['post'])
    def login(self, request, **kwargs):
        serializer = CustomAuthTokenSerializer(data=request.data, context = {'request':request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token = auth_token(user)
            serializer = UserProfileSerializer(user, context = {'request':request})
            return Response({'token': token.key, 'user': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Logout a Client
    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            request.user.auth_token.delete()
        except (AttributeError, ObjectDoesNotExist):
            return Response({'detail': 'Authentication Token Missing or Invalid'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(status=status.HTTP_200_OK)

    # Admin a User
    @action(detail=False, methods=['post'])
    def admin(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        key = request.data.get('key')
        if key != SECRET_KEY:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_superuser(email, email, password)
        email_address, created = EmailAddress.objects.get_or_create(user=user, email=user.email, verified=True, primary=True)
        return Response(status=status.HTTP_200_OK)

    # Check Business Account
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def check(self, request):
        service_provider = request.user.serviceprovider
        account_id = service_provider.account.id
        account = stripe.Account.retrieve(account_id)
        djstripe_account = djstripe.models.Account.sync_from_stripe_data(account)
        service_provider.account = djstripe_account
        service_provider.save()
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Business Account
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def account(self, request):
        serviceprovider = request.user.serviceprovider
        if serviceprovider.account:
            account_id = serviceprovider.account.id
            link = stripe.AccountLink.create(
                account=account_id,
                refresh_url="http://localhost:8080/reauth/",
                return_url="http://localhost:8080/success/",
                type="account_onboarding",
            )
            return Response({'link': link})
        if serviceprovider.business_name:
            business_name = serviceprovider.business_name
        else:
            business_name = 'Wash and Fold'
        account = stripe.Account.create(
            country="US",
            type="express",
            capabilities={
                "transfers": {"requested": True},
                "card_payments": {"requested": True},
            },
            business_type="individual",
            business_profile={"name": business_name},
        )
        djstripe_account = djstripe.models.Account.sync_from_stripe_data(account)
        serviceprovider.account = djstripe_account
        serviceprovider.save()
        link = stripe.AccountLink.create(
            account=account['id'],
            refresh_url="http://localhost:8080/reauth/",
            return_url="http://localhost:8080/success/",
            type="account_onboarding",
        )
        return Response({'link': link}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['POST'])
    def connected(self, request):
        event = None
        payload = request.body
        sig_header = request.META['HTTP_STRIPE_SIGNATURE']

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, CONNECTED_SECRET
            )
        except ValueError as e:
            # Invalid payload
            raise e
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            raise e

        # Handle the event
        if event.type == 'account.updated':
            data = event.data.get("object", {})
            payouts_enabled = data.get('payouts_enabled')
            account_id = data.get('id')

            service_provider = ServiceProvider.objects.get(
                account__id=account_id
            )
            # Conditional can be removed if we are just updating the account info
            if payouts_enabled == True:
                account = stripe.Account.retrieve(account_id)
                djstripe_account = djstripe.models.Account.sync_from_stripe_data(account)
                service_provider.account = djstripe_account
                service_provider.save()
            else:
                # Change if any flags are required
                account = stripe.Account.retrieve(account_id)
                djstripe_account = djstripe.models.Account.sync_from_stripe_data(account)
                service_provider.account = djstripe_account
                service_provider.save()
        return Response(status=status.HTTP_200_OK)


@webhooks.handler("account.updated")
def account_update_handler(event, **kwargs):
    data = event.data.get("object", {})
    payouts_enabled = data.get('payouts_enabled')
    account_id = data.get('id')

    service_provider = ServiceProvider.objects.get(
        account__id=account_id
    )
    # Conditional can be removed if we are just updating the account info
    if payouts_enabled == True:
        account = stripe.Account.retrieve(account_id)
        djstripe_account = djstripe.models.Account.sync_from_stripe_data(account)
        service_provider.account = djstripe_account
        service_provider.save()
    else:
        # Change if any flags are required
        account = stripe.Account.retrieve(account_id)
        djstripe_account = djstripe.models.Account.sync_from_stripe_data(account)
        service_provider.account = djstripe_account
        service_provider.save()

