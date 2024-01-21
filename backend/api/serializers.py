from rest_framework import serializers
from .models import CardList, ListCard, PokemonCardData

class PokemonCardDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = PokemonCardData
        fields = '__all__'

class CardListSerializer(serializers.ModelSerializer):
    cards = serializers.SerializerMethodField()

    class Meta:
        model = CardList
        fields = '__all__'

    def get_cards(self, obj):
        list_cards = ListCard.objects.filter(card_list=obj)
        pokemon_cards = [list_card.pokemon_card for list_card in list_cards if list_card.pokemon_card]
        return PokemonCardDataSerializer(pokemon_cards, many=True).data

class ListCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListCard
        fields = ['id', 'card_list', 'pokemon_card', 'yugioh_card']
