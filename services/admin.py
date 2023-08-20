from django.contrib import admin

from .models import AdminFee, ExtraService

# Register your models here.
admin.site.register(ExtraService)
admin.site.register(AdminFee)