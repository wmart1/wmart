# Generated by Django 2.2.28 on 2022-05-02 07:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='state',
            field=models.CharField(blank=True, max_length=64),
        ),
    ]
