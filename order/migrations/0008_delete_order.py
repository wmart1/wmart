# Generated by Django 2.2.28 on 2022-06-08 08:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0003_delete_review'),
        ('order', '0007_auto_20220502_1138'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Order',
        ),
    ]
