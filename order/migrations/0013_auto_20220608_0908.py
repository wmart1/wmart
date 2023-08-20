# Generated by Django 2.2.28 on 2022-06-08 09:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0012_auto_20220608_0901'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='special_softener',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name='order',
            name='total_price',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=7),
        ),
        migrations.AlterField(
            model_name='orderitem',
            name='total_item_price',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=6),
        ),
    ]