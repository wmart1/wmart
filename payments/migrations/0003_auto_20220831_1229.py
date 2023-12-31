# Generated by Django 2.2.28 on 2022-08-31 12:29

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('djstripe', '0008_2_5'),
        ('serviceproviders', '0006_serviceprovider_skipped_orders'),
        ('order', '0023_auto_20220709_1904'),
        ('payments', '0002_auto_20220608_0931'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name='MoneyTransfer',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=7)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('order', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='transfers', to='order.Order')),
                ('service_provider', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='transfers', to='serviceproviders.ServiceProvider')),
                ('transfer', models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to='djstripe.Transfer')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
