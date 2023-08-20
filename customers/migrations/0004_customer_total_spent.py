# Generated by Django 2.2.28 on 2022-07-10 00:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customers', '0003_customer_phone'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='total_spent',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=8),
        ),
    ]