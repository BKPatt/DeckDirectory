from decimal import Decimal
from django.db import models
from django.contrib.postgres.fields import ArrayField

####################################################
# Lists
####################################################
class CardList(models.Model):
    id = models.AutoField
    created_by = models.CharField(max_length=255)
    created_on = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    market_value = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    cards = models.ForeignKey
    yugioh_cards = models.ForeignKey
    mtg_cards = models.ForeignKey
    lorcana_cards = models.ForeignKey

    def __str__(self):
        return f'ID: {self.id}, Created by: {self.created_by}, Created on: {self.created_on}, Name: {self.name}, Type: {self.type}, Market Value: {self.market_value}'



####################################################
# Yugioh Tables
####################################################
class YugiohCard(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    card_type = models.CharField(max_length=100)
    frame_type = models.CharField(max_length=100)
    description = models.TextField()
    attack = models.IntegerField()
    defense = models.IntegerField()
    level = models.IntegerField()
    race = models.CharField(max_length=100)
    attribute = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} (Type: {self.card_type}, ATK: {self.attack}, DEF: {self.defense}, Level: {self.level}, Race: {self.race}, Attribute: {self.attribute})"

class CardSet(models.Model):
    yugioh_card = models.ForeignKey(YugiohCard, related_name='card_sets', on_delete=models.CASCADE)
    set_name = models.CharField(max_length=255)
    set_code = models.CharField(max_length=100)
    set_rarity = models.CharField(max_length=100)
    set_rarity_code = models.CharField(max_length=100)
    set_price = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.set_name} (Code: {self.set_code}, Rarity: {self.set_rarity}, Price: {self.set_price})"

class CardImage(models.Model):
    yugioh_card = models.ForeignKey(YugiohCard, related_name='card_images', on_delete=models.CASCADE)
    image_url = models.URLField()
    image_url_small = models.URLField()
    image_url_cropped = models.URLField()

    def __str__(self):
        return f"Image URLs - Large: {self.image_url}, Small: {self.image_url_small}, Cropped: {self.image_url_cropped}"

class CardPrice(models.Model):
    yugioh_card = models.ForeignKey(YugiohCard, related_name='card_prices', on_delete=models.CASCADE)
    cardmarket_price = models.CharField(max_length=100)
    tcgplayer_price = models.CharField(max_length=100)
    ebay_price = models.CharField(max_length=100)
    amazon_price = models.CharField(max_length=100)
    coolstuffinc_price = models.CharField(max_length=100)

    def get_average_price(self):
        prices = [self.cardmarket_price, self.ebay_price, self.amazon_price]
        prices = [Decimal(price) for price in prices if price]
        return sum(prices) / len(prices) if prices else Decimal('0.00')

    def __str__(self):
        return f'CardMarket: {self.cardmarket_price}, TCGPlayer: {self.tcgplayer_price}, eBay: {self.ebay_price}, Amazon: {self.amazon_price}, CoolStuffInc: {self.coolstuffinc_price}'



####################################################
# Pokemon Tables
####################################################
class PokemonAbility(models.Model):
    name = models.CharField(max_length=255)
    text = models.TextField()
    type = models.CharField(max_length=100)

    def __str__(self):
        return f'Name: {self.name}, Text: {self.text}, Type: {self.type}'

class PokemonAttack(models.Model):
    name = models.CharField(max_length=255)
    cost = models.JSONField()
    convertedEnergyCost = models.IntegerField()
    damage = models.CharField(max_length=255)
    text = models.TextField(null=True)

    def __str__(self):
        return f'Name: {self.name}, Cost: {self.cost}, ConvertedEnergyCost: {self.convertedEnergyCost}, Damage: {self.damage}, Text: {self.text}'

class PokemonWeakness(models.Model):
    type = models.CharField(max_length=100)
    value = models.CharField(max_length=100)

    def __str__(self):
        return f'Type: {self.type}, Value: {self.value}'

class PokemonCardSet(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    series = models.CharField(max_length=200)
    printedTotal = models.IntegerField()
    total = models.IntegerField()
    legalities = models.JSONField()
    ptcgoCode = models.CharField(max_length=100)
    releaseDate = models.DateField()
    updatedAt = models.DateTimeField(null=True)
    images = models.JSONField()

    def __str__(self):
        return f'ID: {self.id}, Name: {self.name}, Series: {self.series}, PrintedTotal: {self.printedTotal}, Total: {self.total}, Legalities: {self.legalities}, PtcgoCode: {self.ptcgoCode}, ReleaseDate: {self.releaseDate}, UpdatedAt: {self.updatedAt}, Images: {self.images}'

class PokemonTcgplayer(models.Model):
    url = models.URLField(max_length=255)
    updatedAt = models.DateTimeField(null=True)
    prices = models.JSONField()

    def __str__(self):
        return f'URL: {self.url}, UpdatedAt: {self.updatedAt}, Prices: {self.prices}'

class PokemonCardmarket(models.Model):
    url = models.URLField(max_length=255)
    updatedAt = models.DateTimeField(null=True)
    prices = models.JSONField()

    def __str__(self):
        return f'URL: {self.url}, UpdatedAt: {self.updatedAt}, Prices: {self.prices}'

class PokemonCardData(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    supertype = models.CharField(max_length=100)
    subtypes = models.JSONField()
    level = models.CharField(max_length=50, null=True, blank=True)
    hp = models.CharField(max_length=50)
    types = models.JSONField()
    evolvesFrom = models.CharField(max_length=200, null=True, blank=True)
    abilities = models.ManyToManyField(PokemonAbility, blank=True)
    attacks = models.ManyToManyField(PokemonAttack)
    weaknesses = models.ManyToManyField(PokemonWeakness)
    retreatCost = models.JSONField()
    convertedRetreatCost = models.IntegerField()
    set = models.ForeignKey(PokemonCardSet, on_delete=models.CASCADE)
    rules = ArrayField(models.TextField(), blank=True, null=True)
    number = models.CharField(max_length=50)
    artist = models.CharField(max_length=200)
    rarity = models.CharField(max_length=100)
    flavorText = models.TextField(null=True, blank=True)
    nationalPokedexNumbers = models.JSONField()
    legalities = models.JSONField()
    images = models.JSONField()
    tcgplayer = models.ForeignKey(PokemonTcgplayer, on_delete=models.SET_NULL, null=True, blank=True)
    cardmarket = models.ForeignKey(PokemonCardmarket, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return (f'ID: {self.id}, Name: {self.name}, Supertype: {self.supertype}, Subtypes: {self.subtypes}, '
                f'Level: {self.level}, HP: {self.hp}, Types: {self.types}, EvolvesFrom: {self.evolvesFrom}, '
                f'Abilities: {[ability.name for ability in self.abilities.all()]}, Attacks: {[attack.name for attack in self.attacks.all()]}, '
                f'Weaknesses: {[weakness.type for weakness in self.weaknesses.all()]}, RetreatCost: {self.retreatCost}, '
                f'ConvertedRetreatCost: {self.convertedRetreatCost}, Set: {self.set.name}, Rules: {self.rules}, '
                f'Number: {self.number}, Artist: {self.artist}, Rarity: {self.rarity}, FlavorText: {self.flavorText}, '
                f'NationalPokedexNumbers: {self.nationalPokedexNumbers}, Legalities: {self.legalities}, '
                f'Images: {self.images}, Tcgplayer: {self.tcgplayer.url if self.tcgplayer else None}, '
                f'Cardmarket: {self.cardmarket.url if self.cardmarket else None}')



####################################################
# Lorcana Tables
####################################################
class LorcanaCardData(models.Model):
    artist = models.CharField(max_length=200)
    set_name = models.CharField(max_length=200)
    set_num = models.PositiveIntegerField()
    color = models.CharField(max_length=100)
    image = models.URLField()
    cost = models.PositiveIntegerField()
    inkable = models.BooleanField()
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=100)
    rarity = models.CharField(max_length=100)
    flavor_text = models.TextField(blank=True)
    card_num = models.PositiveIntegerField()
    body_text = models.TextField(blank=True)
    set_id = models.CharField(max_length=200)

    def __str__(self):
        return f"Artist: {self.artist}, Set Name: {self.set_name}, Set Num: {self.set_num}, Color: {self.color}, Image: {self.image}, Cost: {self.cost}, Inkable: {self.inkable}, Name: {self.name}, Type: {self.type}, Rarity: {self.rarity}, Flavor Text: {self.flavor_text}, Card Num: {self.card_num}, Body Text: {self.body_text}, Set ID: {self.set_id}"
    


####################################################
# MTG Tables
####################################################
class MTGRelatedCard(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    component = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    type_line = models.CharField(max_length=200)
    uri = models.URLField()

    def __str__(self):
        return f"ID: {self.id}, Component: {self.component}, Name: {self.name}, Type Line: {self.type_line}, URI: {self.uri}"

class MTGCardsData(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    oracle_id = models.UUIDField()
    name = models.CharField(max_length=200)
    lang = models.CharField(max_length=2)
    released_at = models.DateField()
    uri = models.URLField()
    layout = models.CharField(max_length=100)
    image_uris = models.JSONField(blank=True, null=True)
    cmc = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    type_line = models.CharField(max_length=200)
    color_identity = models.JSONField()
    keywords = models.JSONField()
    legalities = models.JSONField()
    games = models.JSONField()
    set = models.CharField(max_length=50)
    set_name = models.CharField(max_length=200)
    set_type = models.CharField(max_length=100)
    rarity = models.CharField(max_length=50)
    artist = models.CharField(max_length=200)
    prices = models.JSONField()
    related_uris = models.JSONField()
    all_parts = models.ManyToManyField(MTGRelatedCard, blank=True)

    def __str__(self):
        return f"ID: {self.id}, Oracle ID: {self.oracle_id}, Name: {self.name}, Language: {self.lang}, Released At: {self.released_at}, URI: {self.uri}, Layout: {self.layout}, CMC: {self.cmc}, Type Line: {self.type_line}, Color Identity: {self.color_identity}, Keywords: {self.keywords}, Legalities: {self.legalities}, Games: {self.games}, Set: {self.set}, Set Name: {self.set_name}, Set Type: {self.set_type}, Rarity: {self.rarity}, Artist: {self.artist}, Prices: {self.prices}, Related URIs: {self.related_uris}"
    
class MTGCardFace(models.Model):
    card = models.ForeignKey(MTGCardsData, on_delete=models.CASCADE, related_name='card_faces')
    id = models.CharField(max_length=100, primary_key=True)
    oracle_id = models.UUIDField(null=True, blank=True)
    name = models.CharField(max_length=200)
    mana_cost = models.CharField(max_length=100)
    type_line = models.CharField(max_length=200)
    oracle_text = models.TextField()
    colors = models.JSONField()
    power = models.CharField(max_length=10)
    toughness = models.CharField(max_length=10)
    artist = models.CharField(max_length=200)
    image_uris = models.JSONField()

    def __str__(self):
        return f"ID: {self.id}, Oracle ID: {self.oracle_id}, Name: {self.name}, Mana Cost: {self.mana_cost}, Type Line: {self.type_line}, Oracle Text: {self.oracle_text}, Colors: {self.colors}, Power: {self.power}, Toughness: {self.toughness}, Artist: {self.artist}"
    


####################################################
# Setup for many-to-many tables with lists and cards
####################################################
class ListCard(models.Model):
    card_list = models.ForeignKey(CardList, on_delete=models.CASCADE, related_name='list_cards')
    pokemon_card = models.ForeignKey(PokemonCardData, on_delete=models.SET_NULL, null=True, blank=True)
    yugioh_card = models.ForeignKey(YugiohCard, on_delete=models.SET_NULL, null=True, blank=True)
    mtg_card = models.ForeignKey(MTGCardsData, on_delete=models.SET_NULL, null=True, blank=True)
    lorcana_card = models.ForeignKey(LorcanaCardData, on_delete=models.SET_NULL, null=True, blank=True)
    market_value = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    collected = models.BooleanField(default=False)

    def __str__(self):
        return f"Card List: {self.card_list}, Pokemon Card: {self.pokemon_card}, Yugioh Card: {self.yugioh_card}, MTG Card: {self.mtg_card}, Lorcana Card: {self.lorcana_card}, Market Value: {self.market_value}, Collected: {self.collected}"

    @property
    def card_market_value(self):
        if self.pokemon_card and self.pokemon_card.cardmarket:
            price = self.pokemon_card.cardmarket.prices.get('averageSellPrice')
            return Decimal(price) if price is not None else Decimal('0.00')
        return Decimal('0.00')


    def save(self, *args, **kwargs):
        self.market_value = self.card_market_value or Decimal('0.00')
        super().save(*args, **kwargs)

CardList.cards = models.ManyToManyField('app_name.PokemonCardData', through='app_name.ListCard', related_name='card_lists')
CardList.yugioh_cards = models.ManyToManyField('app_name.YugiohCard', through='app_name.ListCard', related_name='yugioh_card_lists')
CardList.mtg_cards = models.ManyToManyField('app_name.MTGCardsData', through='app_name.ListCard', related_name='mtg_card_lists')
CardList.lorcana_cards = models.ManyToManyField('app_name.LorcanaCardData', through='app_name.ListCard', related_name='lorcana_card_lists')