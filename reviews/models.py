from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from home.constants import SATISFACTION_TYPES

from users.models import User
from home.models import UUIDModel
from serviceproviders.models import ServiceProvider
from order.models import Order


class Review(UUIDModel):
    """
    A data representation of a service provider's review
    """
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='reviews',
        null=True
    )
    service_provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    order = models.OneToOneField(
        Order,
        on_delete=models.SET_NULL,
        null=True
    )
    rating = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )
    satisfaction = models.CharField(
        choices=SATISFACTION_TYPES,
        max_length=16
    )
    context = models.TextField(
        blank=True
    )
    date = models.DateField(
        auto_now_add=True
    )
    date_time = models.DateTimeField(
        auto_now_add=True
    )


class CustomerReview(UUIDModel):
    """
    A data representation of a customer's review
    """
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='customer_reviews',
        null=True
    )
    service_provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name='customer_reviews'
    )
    order = models.OneToOneField(
        Order,
        on_delete=models.SET_NULL,
        null=True
    )
    rating = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )
    satisfaction = models.CharField(
        choices=SATISFACTION_TYPES,
        max_length=16
    )
    context = models.TextField(
        blank=True
    )
    date = models.DateField(
        auto_now_add=True
    )
    date_time = models.DateTimeField(
        auto_now_add=True
    )
