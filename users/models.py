from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _


import uuid

from djstripe.models import Customer as Account
from home.constants import USER_TYPES


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("Email of User"), max_length=255, unique=True)
    name = models.CharField(_("Name of User"), blank=True, null=True, max_length=255)
    activation_key = models.CharField(max_length=255, blank=True, null=True)
    otp = models.CharField(max_length=6, blank=True, null=True)
    type = models.CharField(choices=USER_TYPES, max_length=32, null=True)
    subscription = models.ForeignKey(
        'djstripe.Subscription', null=True, blank=True, on_delete=models.SET_NULL,
        help_text="The user's Stripe Subscription object, if it exists"
    )
    account = models.ForeignKey(
        Account, null=True, blank=True, on_delete=models.SET_NULL,
        help_text="The user's Stripe Customer object, if it exists"
    )
    registration_id = models.CharField(
        max_length=255,
        blank=True
    )

    def get_absolute_url(self):
        return reverse("users:detail", kwargs={"username": self.username})

    @property
    def active_subscription(self):
        if self.account.valid_subscriptions:
            return True
        return False
