# Generated by Django 2.2.28 on 2022-06-10 09:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0017_order_due_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='tip',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=7),
        ),
    ]
