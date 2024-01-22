from rest_framework import serializers
from .models import CardList, ListCard, PokemonCardData, YugiohCard, MTGCardsData, LorcanaCardData

class PokemonCardDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = PokemonCardData
        fields = '__all__'

class YugiohCardDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = YugiohCard
        fields = '__all__'

class MTGCardDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MTGCardsData
        fields = '__all__'

class LorcanaCardDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = LorcanaCardData
        fields = '__all__'

class CardListSerializer(serializers.ModelSerializer):
    cards = serializers.SerializerMethodField()

    class Meta:
        model = CardList
        fields = '__all__'

    def get_cards(self, obj):
        list_cards = ListCard.objects.filter(card_list=obj)
        card_data = []

        for list_card in list_cards:
            if list_card.pokemon_card:
                card_data.append(PokemonCardDataSerializer(list_card.pokemon_card).data)
            elif list_card.yugioh_card:
                card_data.append(YugiohCardDataSerializer(list_card.yugioh_card).data)
            elif list_card.mtg_card:
                card_data.append(MTGCardDataSerializer(list_card.mtg_card).data)
            elif list_card.lorcana_card:
                card_data.append(LorcanaCardDataSerializer(list_card.lorcana_card).data)

        return card_data

class ListCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListCard
        fields = ['id', 'card_list', 'pokemon_card', 'yugioh_card']
