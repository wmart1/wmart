from home.models import UUIDModel
from users.models import User
from django.contrib.gis.db import models
from django.core.validators import RegexValidator


class Customer(UUIDModel):
    """
    A data representation of the Customer Profile
    """
    # Validators
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,14}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 14 digits allowed."
        )
    # Fields
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo = models.ImageField(upload_to='customer/images', blank=True, null=True)
    street = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=255, blank=True)
    zip = models.CharField(max_length=8, blank=True)
    state = models.CharField(max_length=64, blank=True)
    location = models.PointField(blank=True, null=True)
    phone = models.CharField(
        validators=[phone_regex],
        max_length=17,
        blank=True
    )
    total_spent = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )
    number_of_requests = models.PositiveIntegerField(
        default=0
    )
