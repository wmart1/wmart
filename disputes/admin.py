from django.contrib import admin

from disputes.models import Dispute, Problem

# Register your models here.
admin.site.register(Dispute)
admin.site.register(Problem)