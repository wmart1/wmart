from decimal import Decimal
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from home.utility import send_multiple_notifications

from order.models import History, Order
from order.serializers import OrderSerializer
from payments.serializers import PaymentSerializer
from users.models import User
from payments.models import Payment
from users.authentication import ExpiringTokenAuthentication
from wash_and_fold_34887.settings import STRIPE_TEST_SECRET_KEY

import stripe
import djstripe
from djstripe import webhooks
from datetime import datetime

stripe.api_key = STRIPE_TEST_SECRET_KEY


class PaymentsViewSet(ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = (IsAuthenticated,)
    authentication_classes  = [ExpiringTokenAuthentication]
    queryset = Payment.objects.all()

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def test_payment_method(self, request):
        if request.data.get('decline', False):
            payment_method = stripe.PaymentMethod.create(
                type="card",
                card={
                    "number": "4000000000000002",
                    "exp_month": 2,
                    "exp_year": 2023,
                    "cvc": "314",
                },
                )
        else:
            payment_method = stripe.PaymentMethod.create(
            type="card",
            card={
                "number": "4242424242424242",
                "exp_month": 2,
                "exp_year": 2023,
                "cvc": "314",
            },
            )
        return Response(payment_method)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def process(self, request):
        order_id = request.data.get('order_id')
        payment_method = request.data.get('payment_method')
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'detail': 'Invalid Order ID'}, status=status.HTTP_400_BAD_REQUEST)
        amount = int(order.total_price * 100)
        if order.status != 'Unpaid':
            return Response({'detail': 'Order already paid'}, status=status.HTTP_400_BAD_REQUEST)
        customers_data = stripe.Customer.list().data
        customer = None
        for customer_data in customers_data:
            if customer_data.email == request.user.email:
                customer = customer_data
                break
        if customer is None:
            customer = stripe.Customer.create(email=request.user.email)
        djstripe_customer = djstripe.models.Customer.sync_from_stripe_data(customer)
        payment_method = stripe.PaymentMethod.attach(payment_method, customer=customer)
        djstripe.models.PaymentMethod.sync_from_stripe_data(payment_method)
        request.user.account = djstripe_customer
        request.user.account.save()
        request.user.save()
        try:
            payment_intent = stripe.PaymentIntent.create(
                customer=customer.id, 
                payment_method=payment_method,  
                currency='usd',
                amount=amount,
                confirm=True)
        except:
            return Response('Card Declined', status=status.HTTP_400_BAD_REQUEST)
        djstripe_payment_intent = djstripe.models.PaymentIntent.sync_from_stripe_data(payment_intent)
        Payment.objects.create(
            order=order,
            customer=request.user.customer,
            amount=amount,
            payment_intent=djstripe_payment_intent
        )
        order.status = 'Pending'
        order.paid_at = datetime.now()
        order.save()
        History.objects.create(
                content="Your order has been placed successfully and is pending Service Provider acceptance",
                order=order
            )
        # user_list = User.objects.filter(
        #     serviceprovider__location__dwithin=(order.location, 0.1)
        # )
        user_list = User.objects.filter(
            type="Service Provider"
        )
        users = []
        for user in user_list:
            users.append(user)
        send_multiple_notifications(
            users=users,
            title="There is a new job posted in your area",
            content="There is a new job posted in your area",
            data=order.id,
            data_type="orderId",
        )
        return Response({'payment_intent': payment_intent, 'customer': customer})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_cards(self, request):
        user = request.user
        if user.account:
            customer_id = user.account.id
        else:
            customer_id = None
        if not customer_id:
            customers_data = stripe.Customer.list().data
            customer = None
            for customer_data in customers_data:
                if customer_data.email == request.user.email:
                    customer = customer_data
                    break
            if customer is None:
                customer = stripe.Customer.create(email=request.user.email)
            djstripe_customer = djstripe.models.Customer.sync_from_stripe_data(customer)
            user.account = djstripe_customer
            user.save()
            customer_id = djstripe_customer.id
        payment_methods = stripe.PaymentMethod.list(customer=customer_id, type='card')
        return Response(payment_methods)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def revoke_payment_method(self, request):
        user = request.user
        if user.account:
            customer_id = user.account.id
        else:
            customer_id = None
        payment_method_id = request.data.get('payment_method', None)
        if payment_method_id is None:
            return Response({'detail': 'Missing Payment Method ID'}, status=status.HTTP_400_BAD_REQUEST)
        if not customer_id:
            customers_data = stripe.Customer.list().data
            customer = None
            for customer_data in customers_data:
                if customer_data.email == request.user.email:
                    customer = customer_data
                    break
            if customer is None:
                customer = stripe.Customer.create(email=request.user.email)
            djstripe_customer = djstripe.models.Customer.sync_from_stripe_data(customer)
            user.account = djstripe_customer
            user.save()
            customer_id = djstripe_customer.id
        payment_method = stripe.PaymentMethod.detach(payment_method_id)
        djstripe.models.PaymentMethod.sync_from_stripe_data(payment_method)
        payment_methods = stripe.PaymentMethod.list(customer=customer_id, type='card')
        return Response(payment_methods)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def add_payment_method(self, request):
        user = request.user
        if user.account:
            customer_id = user.account.id
        else:
            customer_id = None
        if not customer_id:
            customers_data = stripe.Customer.list().data
            customer = None
            for customer_data in customers_data:
                if customer_data.email == request.user.email:
                    customer = customer_data
                    break
            if customer is None:
                customer = stripe.Customer.create(email=request.user.email)
            djstripe_customer = djstripe.models.Customer.sync_from_stripe_data(customer)
            user.account = djstripe_customer
            user.save()
            customer_id = djstripe_customer.id
        payment_method_id = request.data.get('payment_method', None)
        if payment_method_id is None:
            return Response({'detail': 'Missing Payment Method ID'}, status=status.HTTP_400_BAD_REQUEST)
        payment_method = stripe.PaymentMethod.attach(payment_method_id, customer=customer_id)
        djstripe.models.PaymentMethod.sync_from_stripe_data(payment_method)
        payment_methods = stripe.PaymentMethod.list(customer=customer_id, type='card')
        return Response(payment_methods)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def set_default(self, request):
        payment_method_id = request.data.get('payment_method', None)
        if payment_method_id is None:
            return Response({'detail': 'Missing Payment Method ID'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if user.account:
            customer_id = user.account.id
        else:
            customer_id = None
        if not customer_id:
            customers_data = stripe.Customer.list().data
            customer = None
            for customer_data in customers_data:
                if customer_data.email == request.user.email:
                    customer = customer_data
                    break
            if customer is None:
                customer = stripe.Customer.create(email=request.user.email)
            djstripe_customer = djstripe.models.Customer.sync_from_stripe_data(customer)
            user.account = djstripe_customer
            user.save()
            customer_id = djstripe_customer.id
        last_default_pms = stripe.PaymentMethod.list(customer=customer_id, type='card')
        for method in last_default_pms:
            if method.metadata:
                stripe.PaymentMethod.modify(
                    method.id,
                    metadata={"default": False}
                )
        payment_method = stripe.PaymentMethod.modify(
            payment_method_id,
            metadata={"default": True})
        djstripe.models.PaymentMethod.sync_from_stripe_data(payment_method)
        payment_methods = stripe.PaymentMethod.list(customer=customer_id, type='card')
        return Response(payment_methods)


    @action(detail=False, methods=['post'])
    def tip(self, request):
        user =  request.user
        order_id = request.data.get('order_id')
        tip = Decimal(request.data.get('tip', 0))
        amount = int(Decimal(tip) * 100)
        if user.account:
            customer_id = user.account.id
        else:
            return Response('Missing user payment info', status=status.HTTP_400_BAD_REQUEST)
        last_default_pms = stripe.PaymentMethod.list(customer=customer_id, type='card')
        payment_method_id = None
        for method in last_default_pms:
            if method.metadata:
                payment_method_id = method.id
        if not payment_method_id:
            for method in last_default_pms:
                payment_method_id = method.id
                break
        if not payment_method_id:
            return Response('No payment info on file', status=status.HTTP_400_BAD_REQUEST)
        try:
            payment_intent = stripe.PaymentIntent.create(
                customer=customer_id, 
                payment_method=payment_method_id,  
                currency='usd',
                amount=amount,
                confirm=True)
        except Exception as e:
            return Response('Card Declined {}'.format(e), status=status.HTTP_400_BAD_REQUEST)
        djstripe_payment_intent = djstripe.models.PaymentIntent.sync_from_stripe_data(payment_intent)
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'detail': 'Invalid Order ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.tip = Decimal(tip)
        order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
