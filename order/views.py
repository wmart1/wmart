from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from home.utility import send_notification
from order.models import Item, Order
from order.serializers import ItemSerializer, OrderSerializer
from datetime import datetime, timedelta

from payments.models import Payment
from services.models import AdminFee

from wash_and_fold_34887.settings import SECRET_KEY
from users.authentication import ExpiringTokenAuthentication

import stripe
import djstripe


class ItemViewSet(ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = (IsAuthenticated,)
    authentication_classes = [ExpiringTokenAuthentication]
    queryset = Item.objects.all()


class OrderViewSet(ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)
    authentication_classes  = [ExpiringTokenAuthentication]
    queryset = Order.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'type', 'date', 'paid', 'service_provider__business_name']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == 'list':
            if self.request.user.type == 'Customer':
                return qs.filter(user=self.request.user)
            elif self.request.user.type == 'Service Provider':
                skipped_orders = self.request.user.serviceprovider.skipped_orders.all()
                qs = qs.exclude(id__in=skipped_orders)
                location = self.request.user.serviceprovider.location
                status = self.request.query_params.get('status', None)
                # if status == 'Pending' and location:
                #     qs = qs.filter(
                #         location__dwithin=(location, 0.1)
                #     )
                # else:
                #     qs = qs.filter(
                #         service_provider=self.request.user.serviceprovider
                #     )
                # Commented out above to remove 1 mile radius and replaced below, may need to comment back in
                if status != 'Pending':
                    return qs.filter(
                        service_provider=self.request.user.serviceprovider
                    )
        return qs


    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def accept(self, request):
        order_id = request.data.get('order_id')
        service_provider = request.user.serviceprovider
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'detail': 'Invalid Order ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Charge the Customer and distribute funds to Service Provider
        if order.user.account:
            customer_id = order.user.account.id
        else:
            return Response('Missing user payment info, cannot accept the order yet', status=status.HTTP_400_BAD_REQUEST)
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

            order.service_provider = service_provider
            order.status = 'In Progress'

            if not order.service_provider.account:
                return Response('Service Provider is missing a Business Account', status=status.HTTP_400_BAD_REQUEST) 
            payment_intent = stripe.PaymentIntent.create(
                customer=customer_id,
                payment_method=payment_method_id,  
                currency='usd',
                amount=int(order.after_tax_total * Decimal(100)),
                confirm=True,
                transfer_group=order_id
                # transfer_data={
                #     'amount': int(provider_amount * Decimal(100)),
                #     'destination': provider_account_id,
                # }
            )

        except Exception as e:
            return Response('Card Error: {}'.format(e), status=status.HTTP_400_BAD_REQUEST)


        if order.priority:
            order.due_date = datetime.now() + timedelta(hours=24)
        else:
            order.due_date = datetime.now() + timedelta(hours=48)

        djstripe_payment_intent = djstripe.models.PaymentIntent.sync_from_stripe_data(payment_intent)

        Payment.objects.create(
            order=order,
            customer=order.user.customer,
            amount=order.total_price,
            payment_intent=djstripe_payment_intent
        )

        order.paid_at = timezone.now()
        order.paid = True
        order.save()

        send_notification(
            user=order.user,
            title="Your order has been accepted by one of our Service Providers",
            content="Your order has been accepted by one of our Service Providers",
            data=order.id,
            data_type='orderId',
        )
        return Response('Order has been accepted successfully', status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def skip(self, request):
        order_id = request.data.get('order_id')
        service_provider = request.user.serviceprovider
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'detail': 'Invalid Order ID'}, status=status.HTTP_400_BAD_REQUEST)
        service_provider.skipped_orders.add(order)
        return Response('Order has been skipped successfully', status=status.HTTP_200_OK)
