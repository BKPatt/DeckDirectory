# Generated by Django 5.0.1 on 2024-01-29 21:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0025_alter_mtgcardsdata_prices'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mtgcardsdata',
            name='cmc',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AlterField(
            model_name='mtgcardsdata',
            name='prices',
            field=models.JSONField(default=0),
            preserve_default=False,
        ),
    ]
