import json
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from django.urls import reverse
from api.models import PokemonCardData, PokemonCardSet, ListCard, CardList, PokemonTcgplayer, PokemonCardmarket
from api.viewsOrganized.pokemon import get_filter_options, get_pokemon_cards_by_list, pokemon_cards_api
from django.utils import timezone
from decimal import Decimal

class PokemonViewsTest(TestCase):

    def setUp(self):
        self.factory = APIRequestFactory()
        self.card_list = CardList.objects.create(
            created_by="testuser",
            name="Test List",
            type="Pokemon",
            market_value=Decimal("100.00"),
            collection_value=Decimal("50.00")
        )

        self.card_set = PokemonCardSet.objects.create(
            id="test-set",
            name="Test Set",
            series="Test Series",
            printedTotal=100,
            total=100,
            legalities={"standard": "Legal"},
            ptcgoCode="TST",
            releaseDate="2023-01-01",
            updatedAt=timezone.now(),
            images={"symbol": "test-symbol.png", "logo": "test-logo.png"}
        )

        self.tcgplayer = PokemonTcgplayer.objects.create(
            url="https://test-tcgplayer.com",
            updatedAt=timezone.now(),
            prices={"holofoil": {"market": 10.00}}
        )
        self.cardmarket = PokemonCardmarket.objects.create(
            url="https://test-cardmarket.com",
            updatedAt=timezone.now(),
            prices={"averageSellPrice": 9.50}
        )

        self.pokemon_card = PokemonCardData.objects.create(
            id="test-pokemon-1",
            name="Test Pokemon",
            supertype="Pokémon",
            subtypes=["Basic"],
            level="5",
            hp="60",
            types=["Colorless"],
            retreatCost=["Colorless"],
            convertedRetreatCost=1,
            number="1",
            artist="Test Artist",
            rarity="Common",
            flavorText="Test flavor text",
            nationalPokedexNumbers=[1],
            legalities={"standard": "Legal"},
            images={"small": "test-small.png", "large": "test-large.png"},
            set=self.card_set,
            tcgplayer=self.tcgplayer,
            cardmarket=self.cardmarket
        )

        self.list_card = ListCard.objects.create(
            card_list=self.card_list,
            pokemon_card=self.pokemon_card,
            market_value=Decimal("10.00"),
            collected=True
        )

    def test_get_pokemon_cards_by_list(self):
        url = reverse('cards-by-list', kwargs={'list_id': self.card_list.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertIn('data', response_data)
        self.assertEqual(len(response_data['data']), 1)

    def test_get_pokemon_cards_by_list_with_filters(self):
        url = reverse('cards-by-list', kwargs={'list_id': self.card_list.id})
        response = self.client.get(url, {'search': 'Test', 'supertype': 'Pokémon'})
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertEqual(len(response_data['data']), 1)
        self.assertEqual(response_data['data'][0]['name'], 'Test Pokemon')

    def test_get_pokemon_cards_by_list_pagination(self):
        url = reverse('cards-by-list', kwargs={'list_id': self.card_list.id})
        response = self.client.get(url, {'page': 1, 'page_size': 1})
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertIn('data', response_data)
        self.assertEqual(len(response_data['data']), 1)
        self.assertEqual(response_data['total_pages'], 1)

    def test_get_filter_options(self):
        url = reverse('filter-options')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        filter_options = json.loads(response.content)
        self.assertIn('types', filter_options)
        self.assertIn('subtypes', filter_options)
        self.assertIn('supertypes', filter_options)
        self.assertIn('rarities', filter_options)
        self.assertIn('sets', filter_options)

    def test_pokemon_cards_api(self):
        url = reverse('pokemon-cards-api')
        response = self.client.get(url, {'page': 1, 'page_size': 20})
        response_data = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertIn('data', response_data)
        self.assertEqual(len(response_data['data']), 1)

    def test_pokemon_cards_api_with_filters(self):
        url = reverse('pokemon-cards-api')
        response = self.client.get(url, {'search': 'Test', 'sort': 'price_asc'})
        response_data = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response_data['data']), 1)
        self.assertEqual(response_data['data'][0]['name'], 'Test Pokemon')

    def test_pokemon_cards_api_pagination(self):
        url = reverse('pokemon-cards-api')
        response = self.client.get(url, {'page': 1, 'page_size': 1})
        response_data = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response_data['data']), 1)
        self.assertEqual(response_data['total_pages'], 1)

    def test_get_filter_options_invalid(self):
        url = '/api/filter-options-invalid/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)
