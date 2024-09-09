from django.test import TestCase
from api.models import YugiohCard, CardSet, CardPrice, CardImage, ListCard, CardList
from decimal import Decimal

class YugiohViewsTest(TestCase):

    def setUp(self):
        self.yugioh_card = YugiohCard.objects.create(
            id=1,
            name="Test Yugioh Card",
            card_type="Monster",
            frame_type="Effect",
            description="Test description",
            attack=2500,
            defense=2000,
            level=8,
            race="Dragon",
            attribute="Dark"
        )

        self.card_set = CardSet.objects.create(
            yugioh_card=self.yugioh_card,
            set_name="Test Set",
            set_code="TST",
            set_rarity="Ultra Rare",
            set_rarity_code="UR",
            set_price="100.00"
        )

        self.card_price = CardPrice.objects.create(
            yugioh_card=self.yugioh_card,
            cardmarket_price="10.00",
            tcgplayer_price="12.00",
            ebay_price="11.00",
            amazon_price="13.00",
            coolstuffinc_price="9.50"
        )

        self.card_image = CardImage.objects.create(
            yugioh_card=self.yugioh_card,
            image_url="http://example.com/large.jpg",
            image_url_small="http://example.com/small.jpg",
            image_url_cropped="http://example.com/cropped.jpg"
        )

        self.card_list = CardList.objects.create(
            created_by="Test User",
            name="Test List",
            type="Yugioh",
            market_value=Decimal("100.00"),
            collection_value=Decimal("50.00")
        )

        self.list_card = ListCard.objects.create(
            card_list=self.card_list,
            yugioh_card=self.yugioh_card,
            market_value=Decimal("15.00"),
            collected=True
        )

    def test_fetch_yugioh_cards(self):
        url = '/api/fetch-yugioh-cards/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('data', response.json())
        self.assertEqual(len(response.json()['data']), 1)

    def test_fetch_yugioh_cards_with_filters(self):
        url = '/api/fetch-yugioh-cards/?search=Test&type=Monster&sort=price_asc'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Test Yugioh Card')

    def test_fetch_yugioh_cards_pagination(self):
        url = '/api/fetch-yugioh-cards/?page=1&page_size=1'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('data', response.json())
        self.assertEqual(len(response.json()['data']), 1)
        self.assertEqual(response.json()['total_pages'], 1)

    def test_get_yugioh_cards_by_list(self):
        url = f'/api/yugioh-cards-by-list/{self.card_list.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('data', response.json())
        self.assertEqual(len(response.json()['data']), 1)

    def test_get_yugioh_cards_by_list_with_filters(self):
        url = f'/api/yugioh-cards-by-list/{self.card_list.id}/?search=Test&type=Monster'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Test Yugioh Card')

    def test_get_yugioh_cards_by_list_pagination(self):
        url = f'/api/yugioh-cards-by-list/{self.card_list.id}/?page=1&page_size=1'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('data', response.json())
        self.assertEqual(len(response.json()['data']), 1)
        self.assertEqual(response.json()['total_pages'], 1)

    def test_get_yugioh_filter_options(self):
        url = '/api/yugioh-filter-options/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        filter_options = response.json()
        self.assertIn('card_type', filter_options)
        self.assertIn('frame_type', filter_options)
        self.assertIn('race', filter_options)
        self.assertIn('attribute', filter_options)
        self.assertIn('rarities', filter_options)
        self.assertIn('set_name', filter_options)

    def test_fetch_yugioh_cards_invalid_page(self):
        url = '/api/fetch-yugioh-cards/?page=9999'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)
