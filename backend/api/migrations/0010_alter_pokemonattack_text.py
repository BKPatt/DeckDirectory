# Generated by Django 5.0.1 on 2024-01-20 04:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_alter_pokemonattack_damage_alter_pokemonattack_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pokemonattack',
            name='text',
            field=models.TextField(null=True),
        ),
    ]
