# Generated by Django 5.0.1 on 2024-01-20 23:48

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_alter_pokemonattack_text'),
    ]

    operations = [
        migrations.AddField(
            model_name='pokemoncarddata',
            name='rules',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.TextField(), blank=True, null=True, size=None),
        ),
    ]
