# Generated by Django 2.2.28 on 2022-06-08 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0016_history'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='due_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
