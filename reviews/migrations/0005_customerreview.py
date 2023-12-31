# Generated by Django 2.2.28 on 2022-07-30 15:16

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('order', '0023_auto_20220709_1904'),
        ('serviceproviders', '0005_serviceprovider_number_of_orders'),
        ('reviews', '0004_review'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomerReview',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('rating', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('satisfaction', models.CharField(choices=[('Bad', 'Bad'), ('Good', 'Good'), ('Excellent', 'Excellent')], max_length=16)),
                ('context', models.TextField(blank=True)),
                ('date', models.DateField(auto_now_add=True)),
                ('date_time', models.DateTimeField(auto_now_add=True)),
                ('order', models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to='order.Order')),
                ('service_provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='customer_reviews', to='serviceproviders.ServiceProvider')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='customer_reviews', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
