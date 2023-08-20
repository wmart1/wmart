from customers.models import Customer
from order.models import Order
from serviceproviders.models import ServiceProvider
from home.models import UUIDModel
from django.db import models
from djstripe.models import PaymentIntent, Transfer


class Payment(UUIDModel):
    """
    A model to represent the Order Payments
    """
    order = models.OneToOneField(
        Order,
        on_delete=models.SET_NULL,
        null=True
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        related_name='payments'
    )
    service_provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.SET_NULL,
        null=True,
        related_name='payments'
    )
    amount = models.DecimalField(
        max_digits=7,
        decimal_places=2
    )
    payment_intent = models.ForeignKey(
        PaymentIntent,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )


class MoneyTransfer(UUIDModel):
    """
    A model to represent the transfers to the Service Providers Stripe account
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transfers'
    )
    service_provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transfers'
    )
    amount = models.DecimalField(
        max_digits=7,
        decimal_places=2
    )
    transfer = models.OneToOneField(
        Transfer,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
