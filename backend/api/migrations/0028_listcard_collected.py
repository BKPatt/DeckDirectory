# Generated by Django 5.0.1 on 2024-01-31 02:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_alter_cardlist_market_value'),
    ]

    operations = [
        migrations.AddField(
            model_name='listcard',
            name='collected',
            field=models.BooleanField(default=False),
        ),
    ]
