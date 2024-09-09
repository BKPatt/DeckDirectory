# from django.test import TestCase
# from decimal import Decimal
# from django.test import TestCase
# from .models import CardList, CardPrice, ListCard, PokemonCardData, YugiohCard

# class CardListModelTest(TestCase):
#     def setUp(self):
#         self.card_list = CardList.objects.create(
#             created_by="Tester",
#             name="Test List",
#             type="Yugioh",
#             market_value=Decimal('100.00'),
#             collection_value=Decimal('50.00')
#         )

#     def test_card_list_creation(self):
#         self.assertEqual(self.card_list.name, "Test List")
#         self.assertEqual(self.card_list.market_value, Decimal('100.00'))

#     def test_card_list_str(self):
#         expected_str = f'ID: {self.card_list.id}, Created by: Tester, Created on: {self.card_list.created_on}, Name: Test List, Type: Yugioh, Market Value: 100.00'
#         self.assertEqual(str(self.card_list), expected_str)


# class YugiohCardModelTest(TestCase):
#     def setUp(self):
#         self.yugioh_card = YugiohCard.objects.create(
#             id=1,
#             name="Blue-Eyes White Dragon",
#             card_type="Monster",
#             frame_type="Effect",
#             description="Powerful monster with immense strength.",
#             attack=3000,
#             defense=2500,
#             level=8,
#             race="Dragon",
#             attribute="Light"
#         )

#     def test_yugioh_card_creation(self):
#         self.assertEqual(self.yugioh_card.name, "Blue-Eyes White Dragon")
#         self.assertEqual(self.yugioh_card.attack, 3000)

#     def test_yugioh_card_str(self):
#         expected_str = "Blue-Eyes White Dragon (Type: Monster, ATK: 3000, DEF: 2500, Level: 8, Race: Dragon, Attribute: Light)"
#         self.assertEqual(str(self.yugioh_card), expected_str)


# class CardPriceModelTest(TestCase):
#     def setUp(self):
#         self.yugioh_card = YugiohCard.objects.create(
#             id=1,
#             name="Blue-Eyes White Dragon",
#             card_type="Monster",
#             frame_type="Effect",
#             description="Powerful monster with immense strength.",
#             attack=3000,
#             defense=2500,
#             level=8,
#             race="Dragon",
#             attribute="Light"
#         )

#         self.card_price = CardPrice.objects.create(
#             yugioh_card=self.yugioh_card,
#             cardmarket_price="3.00",
#             tcgplayer_price="3.50",
#             ebay_price="4.00",
#             amazon_price="3.80",
#             coolstuffinc_price="4.00"
#         )

#     def test_get_average_price(self):
#         self.assertEqual(self.card_price.get_average_price(), Decimal('3.77'))

# class ListCardModelTest(TestCase):
#     def setUp(self):
#         self.pokemon_card = PokemonCardData.objects.create(
#             id="xy1-1",
#             name="Pikachu",
#             supertype="Pokémon",
#             subtypes=["Mouse"],
#             hp="60",
#             types=["Electric"],
#             evolvesFrom="Pichu",
#             retreatCost=["Colorless"],
#             convertedRetreatCost=1,
#             set_id="xy1"
#         )

#         self.card_list = CardList.objects.create(
#             created_by="Tester",
#             name="Test List",
#             type="Pokemon"
#         )

#         self.list_card = ListCard.objects.create(
#             card_list=self.card_list,
#             pokemon_card=self.pokemon_card,
#             market_value=Decimal('2.50'),
#             collected=True
#         )

#     def test_list_card_creation(self):
#         self.assertEqual(self.list_card.market_value, Decimal('2.50'))
#         self.assertTrue(self.list_card.collected)

#     def test_list_card_str(self):
#         expected_str = f"Card in {self.card_list} - Collected: True"
#         self.assertEqual(str(self.list_card), expected_str)

#     def test_card_market_value(self):
#         self.assertEqual(self.list_card.card_market_value, Decimal('0.00'))  # No cardmarket set, returns 0.00
