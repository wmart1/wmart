from django.core.management.base import BaseCommand
from order.models import Order
from datetime import datetime, timedelta
from home.utility import send_notification


class Command(BaseCommand):
    help = 'Send Deadlines For Jobs'

    def handle(self, *args, **kwargs):
        try:
            orders_list = Order.objects.filter(status='In Progress').filter(
                due_date__range=(
                    datetime.now(), datetime.now() + timedelta(hours=2)
                )
            )
            for order in orders_list:
                send_notification(
                    user=order.service_provider.user,
                    title="An order of yours is approaching it's deadline",
                    content="An order of yours is approaching it's deadline",
                    data=order.id,
                    data_type="OrderId"
                )
            self.stdout.write(self.style.SUCCESS('Deadline alerts sent successfully'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(e))
