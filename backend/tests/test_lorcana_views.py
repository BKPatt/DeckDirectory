import json
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from api.models import LorcanaCardData, ListCard, CardList
from decimal import Decimal

class LorcanaViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.card_list = CardList.objects.create(
            created_by="testuser",
            name="Test Lorcana List",
            type="Lorcana",
            market_value=Decimal("100.00"),
            collection_value=Decimal("50.00")
        )

        self.lorcana_card = LorcanaCardData.objects.create(
            artist="Test Artist",
            set_name="Test Set",
            set_num=1,
            color="Blue",
            image="https://test-lorcana.com/image.png",
            cost=3,
            inkable=True,
            name="Test Lorcana Card",
            type="Character",
            rarity="Rare",
            flavor_text="Test flavor text",
            card_num=1,
            body_text="Test body text",
            set_id="set-id"
        )

        self.list_card = ListCard.objects.create(
            card_list=self.card_list,
            lorcana_card=self.lorcana_card,
            market_value=Decimal("3.00"),
            collected=True
        )

    def test_fetch_lorcana_cards(self):
        url = reverse('fetch_lorcana_cards')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "Test Lorcana Card")

    def test_fetch_lorcana_cards_pagination(self):
        url = reverse('fetch_lorcana_cards')
        response = self.client.get(url, {'page': 1, 'page_size': 1})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)

        response_next_page = self.client.get(url, {'page': 2, 'page_size': 1})
        self.assertEqual(response_next_page.status_code, 404)

    def test_fetch_lorcana_cards_with_filters(self):
        url = reverse('fetch_lorcana_cards')
        response = self.client.get(url, {'search': 'Test Lorcana Card', 'color': 'Blue'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['color'], "Blue")

    def test_fetch_lorcana_cards_with_rarity_filter(self):
        url = reverse('fetch_lorcana_cards')
        response = self.client.get(url, {'rarity': 'Rare'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['rarity'], "Rare")

    def test_fetch_lorcana_cards_with_set_filter(self):
        url = reverse('fetch_lorcana_cards')
        response = self.client.get(url, {'set_name': 'Test Set'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['set_name'], "Test Set")

    def test_fetch_lorcana_cards_sort_by_name_asc(self):
        url = reverse('fetch_lorcana_cards')
        response = self.client.get(url, {'sort': 'name_asc'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "Test Lorcana Card")

    def test_fetch_lorcana_cards_sort_by_name_desc(self):
        url = reverse('fetch_lorcana_cards')
        response = self.client.get(url, {'sort': 'name_desc'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "Test Lorcana Card")

    def test_fetch_lorcana_cards_sort_by_price_asc(self):
        url = reverse('fetch_lorcana_cards')
        response = self.client.get(url, {'sort': 'price_asc'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)

    def test_fetch_lorcana_cards_sort_by_price_desc(self):
        url = reverse('fetch_lorcana_cards')
        response = self.client.get(url, {'sort': 'price_desc'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)

    def test_get_lorcana_cards_by_list(self):
        url = reverse('lorcana-cards-by-list', kwargs={'list_id': self.card_list.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "Test Lorcana Card")

    def test_get_lorcana_cards_by_list_with_filters(self):
        url = reverse('lorcana-cards-by-list', kwargs={'list_id': self.card_list.id})
        response = self.client.get(url, {'search': 'Test Lorcana Card', 'color': 'Blue'})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['color'], "Blue")

    def test_get_lorcana_filter_options(self):
        url = reverse('lorcana-filter-options')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        filter_options = response.json()
        self.assertIn('color', filter_options)
        self.assertIn('rarity', filter_options)
        self.assertIn('set_name', filter_options)
