from django.contrib.gis.db import models

from home.models import UUIDModel


class ExtraService(UUIDModel):
    """
    A data representation of the various additional services that
    are available to add onto an order
    """
    name = models.CharField(
        max_length=255
    )
    price = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    def __str__(self):
        return self.name


class AdminFee(UUIDModel):
    """
    A data representation of the admin fee % to be taken from each
    transaction
    """
    amount = models.PositiveIntegerField()
    active = models.BooleanField(
        default=True
    )
