# Generated by Django 5.0.1 on 2024-01-20 15:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_mtgcardsdata_mtgrelatedcard_mtgcardface_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mtgcardface',
            name='oracle_id',
            field=models.UUIDField(blank=True, null=True),
        ),
    ]
