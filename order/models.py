from decimal import Decimal
from django.contrib.gis.db import models
from django.db.models import Sum
from django.contrib.postgres.fields import ArrayField
from home.constants import ORDER_STATUS, ORDER_TYPES
from serviceproviders.models import ServiceProvider
from services.models import ExtraService
from users.models import User

from home.models import UUIDModel


class Item(UUIDModel):
    """
    A data representation of a clothing item and it's associated price
    """
    name = models.CharField(
        max_length=255
    )
    image = models.ImageField(
        upload_to='items/images',
        blank=True,
        null=True
    )
    unit_price = models.DecimalField(
        max_digits=6,
        decimal_places=2
    )

    def __str__(self):
        return self.name


class Order(UUIDModel):
    """
    A data representation of a Customer's Order
    """
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='orders'
    )
    service_provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    type = models.CharField(
        choices=ORDER_TYPES,
        default='Wash and Fold',
        max_length=32
    )
    street = models.CharField(
        max_length=255
    )
    city = models.CharField(
        max_length=255
    )
    zip = models.CharField(
        max_length=8
    )
    state = models.CharField(
        max_length=64
    )
    location = models.PointField()
    special_detergent = models.BooleanField(
        default=False
    )
    special_softener = models.BooleanField(
        default=False
    )
    intensive_clean = models.BooleanField(
        default=False
    )
    priority = models.BooleanField(
        default=False
    )
    status = models.CharField(
        choices=ORDER_STATUS,
        max_length=32,
        default="Pending"
    )
    date = models.DateField(
        auto_now_add=True
    )
    date_time = models.DateTimeField(
        auto_now_add=True
    )
    total_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    total_price = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0
    )
    tax = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    after_tax_total = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0
    )
    tip = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0
    )
    paid = models.BooleanField(
        default=False
    )
    paid_at = models.DateTimeField(
        blank=True,
        null=True
    )
    due_date = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ['-date']

    def save(self, *args, **kwargs):
        self.tax = self.total_price * Decimal(0.15)
        self.after_tax_total = self.total_price + self.tax
        return super().save(*args, **kwargs)


class OrderItem(UUIDModel):
    """
    A data representation of an Item on an Order with it's
    associated quantity
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        null=True
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.SET_NULL,
        null=True,
        related_name='items'
    )
    quantity = models.PositiveIntegerField()
    iron = models.BooleanField(
        default=False
    )
    total_item_price = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0
    )

    def save(self, *args, **kwargs):
        if self.order.type == 'Wash and Fold':
            if self.iron:
                iron_price = ExtraService.objects.filter(
                    name="Ironing"
                ).values_list('price', flat=True)[0]
                self.total_item_price += iron_price * self.quantity
        elif self.order.type == 'Dry Cleaning':
            self.total_item_price = self.item.unit_price * self.quantity
        return super().save(*args, **kwargs)


class History(UUIDModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='history')
    content = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
