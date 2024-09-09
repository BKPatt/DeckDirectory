import json
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from api.models import MTGCardsData, ListCard, CardList
from decimal import Decimal
import uuid

class MTGViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.card_list = CardList.objects.create(
            created_by="testuser",
            name="Test List",
            type="MTG",
            market_value=Decimal("100.00"),
            collection_value=Decimal("50.00")
        )

        self.mtg_card = MTGCardsData.objects.create(
            id="test-mtg-card",
            oracle_id=uuid.uuid4(),
            name="Test MTG Card",
            lang="en",
            released_at="2023-01-01",
            uri="https://test-mtg.com",
            layout="normal",
            image_uris={"small": "https://test-mtg.com/small.png", "large": "https://test-mtg.com/large.png"},
            cmc=Decimal("3.00"),
            type_line="Creature — Dragon",
            color_identity=["R"],
            keywords=["Flying"],
            legalities={"standard": "Legal"},
            games=["paper"],
            set="test-set",
            set_name="Test Set",
            set_type="expansion",
            rarity="Rare",
            artist="Test Artist",
            prices={"usd": "3.00"},
            related_uris={"tcgplayer": "https://tcgplayer.com/test-card"},
        )

        self.list_card = ListCard.objects.create(
            card_list=self.card_list,
            mtg_card=self.mtg_card,
            market_value=Decimal("3.00"),
            collected=True
        )

    def test_fetch_mtg_cards(self):
        url = reverse('fetch_mtg_cards')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "Test MTG Card")

    def test_fetch_mtg_cards_pagination(self):
        url = reverse('fetch_mtg_cards')
        response = self.client.get(url, {'page': 1, 'page_size': 1})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)

        response_next_page = self.client.get(url, {'page': 2, 'page_size': 1})
        self.assertEqual(response_next_page.status_code, 404)

    def test_fetch_mtg_cards_with_filters(self):
        url = reverse('fetch_mtg_cards')
        response = self.client.get(url, {'search': 'Dragon', 'type_line': 'Creature'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['type_line'], "Creature — Dragon")

    def test_fetch_mtg_cards_with_rarity_filter(self):
        url = reverse('fetch_mtg_cards')
        response = self.client.get(url, {'rarity': 'Rare'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['rarity'], "Rare")

    def test_fetch_mtg_cards_with_set_filter(self):
        url = reverse('fetch_mtg_cards')
        response = self.client.get(url, {'set': 'Test Set'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['set_name'], "Test Set")

    def test_fetch_mtg_cards_sort_by_name_asc(self):
        url = reverse('fetch_mtg_cards')
        response = self.client.get(url, {'sort': 'name_asc'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "Test MTG Card")

    def test_fetch_mtg_cards_sort_by_name_desc(self):
        url = reverse('fetch_mtg_cards')
        response = self.client.get(url, {'sort': 'name_desc'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "Test MTG Card")

    def test_fetch_mtg_cards_sort_by_price_asc(self):
        url = reverse('fetch_mtg_cards')
        response = self.client.get(url, {'sort': 'price_asc'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)

    def test_fetch_mtg_cards_sort_by_price_desc(self):
        url = reverse('fetch_mtg_cards')
        response = self.client.get(url, {'sort': 'price_desc'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)

    def test_get_mtg_cards_by_list(self):
        url = reverse('mtg-cards-by-list', kwargs={'list_id': self.card_list.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "Test MTG Card")

    def test_get_mtg_cards_by_list_with_filters(self):
        url = reverse('mtg-cards-by-list', kwargs={'list_id': self.card_list.id})

        response_with_search_filter = self.client.get(url, {'search': 'Test MTG Card'})
        data_with_search_filter = response_with_search_filter.json()['data']

        response_with_filters = self.client.get(url, {'search': 'Test MTG Card', 'type_line': 'Creature'})
        data_with_filters = response_with_filters.json()['data']

        self.assertEqual(response_with_search_filter.status_code, 200)
        self.assertEqual(len(data_with_search_filter), 1)

        self.assertEqual(response_with_filters.status_code, 200)
        self.assertEqual(len(data_with_filters), 1)
        self.assertEqual(data_with_filters[0]['type_line'], "Creature — Dragon")

    def test_get_mtg_filter_options(self):
        url = reverse('mtg-filter-options')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        filter_options = response.json()
        self.assertIn('type_line', filter_options)
        self.assertIn('rarities', filter_options)
        self.assertIn('sets', filter_options)
