from rest_framework import serializers
from .models import CardList

class CardListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardList
        fields = '__all__'
