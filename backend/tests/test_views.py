import json
from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from api.models import (
    PokemonCardData, MTGCardsData, YugiohCard, LorcanaCardData, CardList, ListCard, PokemonCardSet
)

class ViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.pokemon_card_set = PokemonCardSet.objects.create(
            id="test-set-id",
            name="Test Set",
            series="Test Series",
            printedTotal=100,
            total=150,
            legalities={"standard": "Legal"},
            ptcgoCode="PTCGO",
            releaseDate="2023-01-01",
            updatedAt=None,
            images={"small": "https://example.com/small.png", "large": "https://example.com/large.png"}
        )

        self.card_list = CardList.objects.create(
            created_by="testuser",
            name="Test List",
            type="Pokemon",
            market_value=Decimal("100.00"),
            collection_value=Decimal("50.00")
        )

        self.pokemon_card = PokemonCardData.objects.create(
            id="test-pokemon-card",
            name="Pikachu",
            supertype="Pokémon",
            subtypes=["Basic"],
            level="5",
            hp="60",
            types=["Electric"],
            evolvesFrom="Pichu",
            retreatCost=["Colorless"],
            convertedRetreatCost=1,
            set=self.pokemon_card_set,
            number="001",
            artist="Artist Name",
            rarity="Rare",
            flavorText="This is Pikachu",
            nationalPokedexNumbers=[25],
            legalities={"standard": "Legal"},
            images={"small": "https://example.com/small.png"}
        )

        self.uncollected_list_card = ListCard.objects.create(
            card_list=self.card_list,
            pokemon_card=self.pokemon_card,
            market_value=Decimal("3.00"),
            collected=False
        )

        self.collected_list_card = ListCard.objects.create(
            card_list=self.card_list,
            pokemon_card=self.pokemon_card,
            market_value=Decimal("3.00"),
            collected=True
        )

    def test_add_card_to_list(self):
        url = reverse('add-card-to-list')
        data = {
            'list_id': self.card_list.id,
            'card_id': self.pokemon_card.id,
            'card_type': 'pokemon'
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['new_card_count'], 3)

    def test_add_card_with_mocked_market_price(self):
        url = reverse('add-card-to-list')
        data = {
            'list_id': self.card_list.id,
            'card_id': self.pokemon_card.id,
            'card_type': 'pokemon'
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)

    def test_card_collection_add(self):
        url = reverse('card-collection')
        data = {
            'list_id': self.card_list.id,
            'card_id': self.pokemon_card.id,
            'card_type': 'pokemon',
            'operation': 'add'
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)

    def test_card_collection_remove(self):
        url = reverse('card-collection')
        data = {
            'list_id': self.card_list.id,
            'card_id': self.pokemon_card.id,
            'card_type': 'pokemon',
            'operation': 'remove'
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)

    def test_delete_card_from_list(self):
        url = reverse('delete-card-from-list')
        data = {
            'list_id': self.card_list.id,
            'card_id': self.pokemon_card.id,
            'card_type': 'pokemon'
        }
        response = self.client.delete(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)

    def test_get_list_by_id(self):
        url = reverse('get-list-by-id', kwargs={'list_id': self.card_list.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['card_list']['name'], self.card_list.name)

    def test_set_card_quantity(self):
        url = reverse('set-card-quantity')
        data = {
            'list_id': self.card_list.id,
            'card_id': self.pokemon_card.id,
            'card_type': 'pokemon',
            'collected': True
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)

    def test_update_card_quantity_increment(self):
        url = reverse('update-card-quantity')
        data = {
            'list_id': self.card_list.id,
            'card_id': self.pokemon_card.id,
            'card_type': 'pokemon',
            'operation': 'increment'
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)

    def test_update_card_quantity_decrement(self):
        url = reverse('update-card-quantity')
        data = {
            'list_id': self.card_list.id,
            'card_id': self.pokemon_card.id,
            'card_type': 'pokemon',
            'operation': 'decrement'
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)

    def test_update_list(self):
        url = reverse('update-list', kwargs={'list_id': self.card_list.id})
        data = {
            'name': 'Updated List Name',
            'type': 'Updated Type'
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['message'], 'List updated successfully')
