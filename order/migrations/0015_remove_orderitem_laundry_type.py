# Generated by Django 2.2.28 on 2022-06-08 09:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0014_auto_20220608_0931'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='orderitem',
            name='laundry_type',
        ),
    ]