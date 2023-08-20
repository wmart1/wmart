# Generated by Django 2.2.28 on 2022-05-02 07:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('serviceproviders', '0001_initial'),
        ('order', '0003_auto_20220501_1301'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='service_provider',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to='serviceproviders.ServiceProvider'),
        ),
    ]
