from home.constants import LANGUAGE_TYPES
from home.models import UUIDModel
from users.models import User
from django.contrib.gis.db import models
from django.core.validators import RegexValidator
from djstripe.models import Account



class ServiceProvider(UUIDModel):
    """
    A data representation of the Service Provider Profile
    """
    # Validators
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,14}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 14 digits allowed."
        )
    # Fields
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
    )
    photo = models.ImageField(
        upload_to='service-provider/profile',
        blank=True,
        null=True
    )
    bio = models.TextField(
        blank=True
    )
    business_name = models.CharField(
        max_length=255,
        blank=True
    )
    registration_number = models.CharField(
        max_length=255,
        blank=True
    )
    phone = models.CharField(
        validators=[phone_regex],
        max_length=17,
        blank=True
    )
    street = models.CharField(
        max_length=255,
        blank=True
    )
    city = models.CharField(
        max_length=255,
        blank=True
    )
    zip = models.CharField(
        max_length=8,
        blank=True
    )
    state = models.CharField(
        max_length=64,
        blank=True
    )
    location = models.PointField(
        blank=True, 
        null=True
    )
    dry_cleaning = models.BooleanField(
        default=False
    )
    hang = models.BooleanField(
        default=True
    )
    special_detergent = models.BooleanField(
        default=True
    )
    special_softener = models.BooleanField(
        default=True
    )
    intensive_clean = models.BooleanField(
        default=True
    )
    ironing = models.BooleanField(
        default=True
    )
    priority = models.BooleanField(
        default=True
    )
    preferred_language = models.CharField(
        choices=LANGUAGE_TYPES,
        max_length=32,
        default='English'
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="The service provider's Stripe Account object, if it exists"
    )
    generated_revenue = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )
    earnings = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )
    number_of_orders = models.PositiveIntegerField(
        default=0
    )
    skipped_orders = models.ManyToManyField(
        'order.Order',
        blank=True
    )
