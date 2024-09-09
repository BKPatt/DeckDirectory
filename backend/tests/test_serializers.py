import uuid
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from api.models import (
    CardList, ListCard, PokemonCardData, YugiohCard, MTGCardsData, LorcanaCardData, PokemonCardSet
)
from api.serializers import (
    PokemonCardDataSerializer, YugiohCardDataSerializer, MTGCardDataSerializer,
    LorcanaCardDataSerializer, CardListSerializer, ListCardSerializer
)

class PokemonCardDataSerializerTest(TestCase):
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
            set=self.card_set,
            number="1",
            artist="Test Artist",
            rarity="Common",
            flavorText="Test flavor text",
            nationalPokedexNumbers=[1],
            legalities={"standard": "Legal"},
            images={"small": "test-small.png", "large": "test-large.png"}
        )

    def test_pokemon_card_data_serializer(self):
        serializer = PokemonCardDataSerializer(self.pokemon_card)
        data = serializer.data

        self.assertEqual(data['name'], self.pokemon_card.name)
        self.assertEqual(data['supertype'], self.pokemon_card.supertype)
        self.assertEqual(data['hp'], self.pokemon_card.hp)
        self.assertEqual(data['types'], self.pokemon_card.types)


class YugiohCardDataSerializerTest(TestCase):
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

    def test_yugioh_card_data_serializer(self):
        serializer = YugiohCardDataSerializer(self.yugioh_card)
        data = serializer.data

        self.assertEqual(data['name'], self.yugioh_card.name)
        self.assertEqual(data['card_type'], self.yugioh_card.card_type)
        self.assertEqual(data['attack'], self.yugioh_card.attack)
        self.assertEqual(data['defense'], self.yugioh_card.defense)


class MTGCardDataSerializerTest(TestCase):
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
            legalities={"standard": "Legal", "modern": "Legal"},
            games=["paper", "mtgo"],
            prices={"usd": "1.00", "usd_foil": "2.00"},
            related_uris={"gatherer": "https://gatherer.wizards.com/test"}
        )

    def test_mtg_card_data_serializer(self):
        serializer = MTGCardDataSerializer(self.mtg_card)
        data = serializer.data

        self.assertEqual(float(data['cmc']), float(self.mtg_card.cmc))
        self.assertEqual(data['name'], self.mtg_card.name)
        self.assertEqual(data['type_line'], self.mtg_card.type_line)

class LorcanaCardDataSerializerTest(TestCase):
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

    def test_lorcana_card_data_serializer(self):
        serializer = LorcanaCardDataSerializer(self.lorcana_card)
        data = serializer.data

        self.assertEqual(data['name'], self.lorcana_card.name)
        self.assertEqual(data['artist'], self.lorcana_card.artist)
        self.assertEqual(data['color'], self.lorcana_card.color)
        self.assertEqual(data['cost'], self.lorcana_card.cost)


class CardListSerializerTest(TestCase):
    def setUp(self):
        self.card_list = CardList.objects.create(
            created_by="testuser",
            name="Test List",
            type="Pokemon",
            market_value=Decimal("100.00"),
            collection_value=Decimal("50.00")
        )

    def test_card_list_serializer(self):
        serializer = CardListSerializer(self.card_list)
        data = serializer.data

        self.assertEqual(str(data['market_value']), str(self.card_list.market_value))
        self.assertEqual(str(data['collection_value']), str(self.card_list.collection_value))

    def test_get_cards(self):
        serializer = CardListSerializer(self.card_list)
        data = serializer.data

        self.assertEqual(data['cards'], [])


class ListCardSerializerTest(TestCase):
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
            set=self.card_set,
            number="1",
            artist="Test Artist",
            rarity="Common",
            flavorText="Test flavor text",
            nationalPokedexNumbers=[1],
            legalities={"standard": "Legal"},
            images={"small": "test-small.png", "large": "test-large.png"}
        )
        self.list_card = ListCard.objects.create(
            card_list=self.card_list,
            pokemon_card=self.pokemon_card,
            market_value=Decimal("10.00"),
            collected=True
        )

    def test_list_card_serializer(self):
        serializer = ListCardSerializer(self.list_card)
        data = serializer.data

        self.assertEqual(data['market_value'], str(self.list_card.market_value))
        self.assertEqual(data['collected'], self.list_card.collected)
        self.assertEqual(data['card_list'], self.card_list.id)
        self.assertEqual(data['pokemon_card'], self.pokemon_card.id)
