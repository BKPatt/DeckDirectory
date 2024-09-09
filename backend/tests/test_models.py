import uuid
from django.test import TestCase
from decimal import Decimal
from django.utils import timezone
from api.models import (
    CardList, ListCard, PokemonCardData, LorcanaCardData,
    MTGCardsData, YugiohCard, CardSet, CardImage, CardPrice,
    PokemonCardSet, PokemonTcgplayer, PokemonCardmarket
)

class CardListModelTest(TestCase):
    def setUp(self):
        self.card_list = CardList.objects.create(
            created_by="testuser",
            name="Test List",
            type="Pokemon",
            market_value=Decimal("100.00"),
            collection_value=Decimal("50.00")
        )

    def test_card_list_creation(self):
        self.assertTrue(isinstance(self.card_list, CardList))
        self.assertEqual(self.card_list.__str__(), f'ID: {self.card_list.id}, Created by: testuser, Created on: {self.card_list.created_on}, Name: Test List, Type: Pokemon, Market Value: 100.00')

    def test_card_list_fields(self):
        self.assertEqual(self.card_list.created_by, "testuser")
        self.assertEqual(self.card_list.name, "Test List")
        self.assertEqual(self.card_list.type, "Pokemon")
        self.assertEqual(self.card_list.market_value, Decimal("100.00"))
        self.assertEqual(self.card_list.collection_value, Decimal("50.00"))

    def test_card_list_negative_values(self):
        card_list = CardList.objects.create(
            created_by="testuser",
            name="Negative Value List",
            type="Pokemon",
            market_value=Decimal("-100.00")
        )
        self.assertEqual(card_list.market_value, Decimal("-100.00"))

    def test_card_list_max_length(self):
        max_length_name = "x" * 255
        card_list = CardList.objects.create(
            created_by="testuser",
            name=max_length_name,
            type="Pokemon"
        )
        self.assertEqual(len(card_list.name), 255)

class ListCardModelTest(TestCase):
    def setUp(self):
        self.card_list = CardList.objects.create(
            created_by="testuser",
            name="Test List",
            type="Pokemon"
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
        
        self.pokemon_card = PokemonCardData.objects.create(
            id="test-pokemon-1",
            name="Test Pokemon",
            supertype="Pokémon",
            subtypes=["Basic"],
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
            set=self.card_set
        )
        
        self.list_card = ListCard.objects.create(
            card_list=self.card_list,
            pokemon_card=self.pokemon_card,
            market_value=Decimal("10.00"),
            collected=True
        )

    def test_list_card_creation(self):
        self.assertTrue(isinstance(self.list_card, ListCard))
        self.assertEqual(self.list_card.__str__(), f"Card in {self.card_list} - Collected: True")

    def test_list_card_fields(self):
        self.assertEqual(self.list_card.card_list, self.card_list)
        self.assertEqual(self.list_card.pokemon_card, self.pokemon_card)
        self.assertEqual(self.list_card.market_value, Decimal('0.00'))
        self.assertTrue(self.list_card.collected)

    def test_list_card_card_instance(self):
        self.assertEqual(self.list_card.card_instance, self.pokemon_card)

class LorcanaCardDataModelTest(TestCase):
    def setUp(self):
        self.lorcana_card = LorcanaCardData.objects.create(
            artist="Test Artist",
            set_name="Test Set",
            set_num=1,
            color="Blue",
            image="https://test-image.com/card.jpg",
            cost=3,
            inkable=True,
            name="Test Lorcana Card",
            type="Character",
            rarity="Rare",
            flavor_text="Test flavor text",
            card_num=1,
            body_text="Test body text",
            set_id="TST"
        )

    def test_lorcana_card_creation(self):
        self.assertTrue(isinstance(self.lorcana_card, LorcanaCardData))
        self.assertEqual(self.lorcana_card.__str__(), "Artist: Test Artist, Set Name: Test Set, Set Num: 1, Color: Blue, Image: https://test-image.com/card.jpg, Cost: 3, Inkable: True, Name: Test Lorcana Card, Type: Character, Rarity: Rare, Flavor Text: Test flavor text, Card Num: 1, Body Text: Test body text, Set ID: TST")

    def test_lorcana_card_fields(self):
        self.assertEqual(self.lorcana_card.artist, "Test Artist")
        self.assertEqual(self.lorcana_card.set_name, "Test Set")
        self.assertEqual(self.lorcana_card.set_num, 1)
        self.assertEqual(self.lorcana_card.color, "Blue")
        self.assertEqual(self.lorcana_card.cost, 3)
        self.assertTrue(self.lorcana_card.inkable)
        self.assertEqual(self.lorcana_card.name, "Test Lorcana Card")
        self.assertEqual(self.lorcana_card.type, "Character")
        self.assertEqual(self.lorcana_card.rarity, "Rare")

class MTGCardsDataModelTest(TestCase):
    def setUp(self):
        self.mtg_card = MTGCardsData.objects.create(
            id="test-mtg-1",
            oracle_id=uuid.uuid4(),
            name="Test MTG Card",
            lang="en",
            released_at="2023-01-01",
            uri="https://test-uri.com",
            layout="normal",
            image_uris={"small": "test-small.jpg", "normal": "test-normal.jpg"},
            cmc=3.0,
            type_line="Creature — Human Wizard",
            color_identity=["U"],
            keywords=["Flying"],
            legalities={"standard": "legal", "modern": "legal"},
            games=["paper", "mtgo"],
            set="TST",
            set_name="Test Set",
            set_type="expansion",
            rarity="rare",
            artist="Test Artist",
            prices={"usd": "1.00", "usd_foil": "2.00"},
            related_uris={"gatherer": "https://gatherer.wizards.com/test"}
        )

    def test_mtg_card_creation(self):
        self.assertTrue(isinstance(self.mtg_card, MTGCardsData))
        expected_str = f"ID: test-mtg-1, Oracle ID: {self.mtg_card.oracle_id}, Name: Test MTG Card, Language: en, Released At: 2023-01-01, URI: https://test-uri.com, Layout: normal, CMC: 3.0, Type Line: Creature — Human Wizard, Color Identity: ['U'], Keywords: ['Flying'], Legalities: {{'standard': 'legal', 'modern': 'legal'}}, Games: ['paper', 'mtgo'], Set: TST, Set Name: Test Set, Set Type: expansion, Rarity: rare, Artist: Test Artist, Prices: {{'usd': '1.00', 'usd_foil': '2.00'}}, Related URIs: {{'gatherer': 'https://gatherer.wizards.com/test'}}"
        self.assertEqual(self.mtg_card.__str__(), expected_str)

    def test_mtg_card_fields(self):
        self.assertEqual(self.mtg_card.name, "Test MTG Card")
        self.assertEqual(self.mtg_card.lang, "en")
        self.assertEqual(self.mtg_card.released_at, "2023-01-01")
        self.assertEqual(self.mtg_card.cmc, 3.0)
        self.assertEqual(self.mtg_card.type_line, "Creature — Human Wizard")
        self.assertEqual(self.mtg_card.color_identity, ["U"])
        self.assertEqual(self.mtg_card.rarity, "rare")
        self.assertEqual(self.mtg_card.artist, "Test Artist")

class PokemonCardDataModelTest(TestCase):
    def setUp(self):
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
            evolvesFrom="Test Pre-evolution",
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

    def test_pokemon_card_creation(self):
        self.assertTrue(isinstance(self.pokemon_card, PokemonCardData))
        expected_str = f"ID: {self.pokemon_card.id}, Name: {self.pokemon_card.name}, Supertype: {self.pokemon_card.supertype}, Subtypes: {self.pokemon_card.subtypes}, Level: {self.pokemon_card.level}, HP: {self.pokemon_card.hp}, Types: {self.pokemon_card.types}, EvolvesFrom: {self.pokemon_card.evolvesFrom}, Abilities: [], Attacks: [], Weaknesses: [], RetreatCost: {self.pokemon_card.retreatCost}, ConvertedRetreatCost: {self.pokemon_card.convertedRetreatCost}, Set: {self.pokemon_card.set.name}, Rules: {self.pokemon_card.rules}, Number: {self.pokemon_card.number}, Artist: {self.pokemon_card.artist}, Rarity: {self.pokemon_card.rarity}, FlavorText: {self.pokemon_card.flavorText}, NationalPokedexNumbers: {self.pokemon_card.nationalPokedexNumbers}, Legalities: {self.pokemon_card.legalities}, Images: {self.pokemon_card.images}, Tcgplayer: {self.pokemon_card.tcgplayer.url}, Cardmarket: {self.pokemon_card.cardmarket.url}"
        self.assertEqual(str(self.pokemon_card), expected_str)

    def test_pokemon_card_fields(self):
        self.assertEqual(self.pokemon_card.name, "Test Pokemon")
        self.assertEqual(self.pokemon_card.supertype, "Pokémon")
        self.assertEqual(self.pokemon_card.subtypes, ["Basic"])
        self.assertEqual(self.pokemon_card.hp, "60")
        self.assertEqual(self.pokemon_card.types, ["Colorless"])
        self.assertEqual(self.pokemon_card.number, "1")
        self.assertEqual(self.pokemon_card.artist, "Test Artist")
        self.assertEqual(self.pokemon_card.rarity, "Common")

    def test_pokemon_card_relationships(self):
        self.assertEqual(self.pokemon_card.set, self.card_set)
        self.assertEqual(self.pokemon_card.tcgplayer, self.tcgplayer)
        self.assertEqual(self.pokemon_card.cardmarket, self.cardmarket)

class YugiohCardModelTest(TestCase):
    def setUp(self):
        self.yugioh_card = YugiohCard.objects.create(
            id=1,
            name="Test Yugioh Card",
            card_type="Effect Monster",
            frame_type="effect",
            description="Test description",
            attack=1000,
            defense=1000,
            level=4,
            race="Warrior",
            attribute="LIGHT"
        )
        self.card_set = CardSet.objects.create(
            yugioh_card=self.yugioh_card,
            set_name="Test Set",
            set_code="TST-001",
            set_rarity="Common",
            set_rarity_code="C",
            set_price="1.00"
        )
        self.card_image = CardImage.objects.create(
            yugioh_card=self.yugioh_card,
            image_url="https://test-image.com/large.jpg",
            image_url_small="https://test-image.com/small.jpg",
            image_url_cropped="https://test-image.com/cropped.jpg"
        )
        self.card_price = CardPrice.objects.create(
            yugioh_card=self.yugioh_card,
            cardmarket_price="1.00",
            tcgplayer_price="1.10",
            ebay_price="1.20",
            amazon_price="1.30",
            coolstuffinc_price="1.40"
        )

    def test_yugioh_card_creation(self):
        self.assertTrue(isinstance(self.yugioh_card, YugiohCard))
        self.assertEqual(self.yugioh_card.__str__(), "Test Yugioh Card (Type: Effect Monster, ATK: 1000, DEF: 1000, Level: 4, Race: Warrior, Attribute: LIGHT)")

    def test_yugioh_card_fields(self):
        self.assertEqual(self.yugioh_card.name, "Test Yugioh Card")
        self.assertEqual(self.yugioh_card.card_type, "Effect Monster")
        self.assertEqual(self.yugioh_card.frame_type, "effect")
        self.assertEqual(self.yugioh_card.attack, 1000)
        self.assertEqual(self.yugioh_card.defense, 1000)
        self.assertEqual(self.yugioh_card.level, 4)
        self.assertEqual(self.yugioh_card.race, "Warrior")
        self.assertEqual(self.yugioh_card.attribute, "LIGHT")

    def test_yugioh_card_relationships(self):
        self.assertEqual(self.yugioh_card.card_sets.first(), self.card_set)
        self.assertEqual(self.yugioh_card.card_images.first(), self.card_image)
        self.assertEqual(self.yugioh_card.card_prices.first(), self.card_price)
