from home.models import UUIDModel
from users.models import User
from django.contrib.gis.db import models
from django.core.validators import RegexValidator


class Dispute(UUIDModel):
    """
    A data representation of a Dispute filed by a Customer
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='disputes'
    )
    message = models.TextField()
    subject = models.CharField(
        blank=True,
        max_length=255
    )
    photo = models.ImageField(
        upload_to='dispute/images',
        blank=True,
        null=True
    )


class Problem(UUIDModel):
    """
    A data representation of the Report A Problem feature
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='problems'
    )
    message = models.TextField()
