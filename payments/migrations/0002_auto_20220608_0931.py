# Generated by Django 2.2.28 on 2022-06-08 09:31

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('djstripe', '0008_2_5'),
        ('customers', '0003_customer_phone'),
        ('serviceproviders', '0001_initial'),
        ('order', '0014_auto_20220608_0931'),
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=7)),
                ('customer', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments', to='customers.Customer')),
                ('order', models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to='order.Order')),
                ('payment_intent', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='djstripe.PaymentIntent')),
                ('service_provider', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments', to='serviceproviders.ServiceProvider')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.DeleteModel(
            name='SubscriptionSetup',
        ),
    ]
