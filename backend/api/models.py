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
    market_value = models.DecimalField(max_digits=10, decimal_places=2)
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

class CardSet(models.Model):
    yugioh_card = models.ForeignKey(YugiohCard, related_name='card_sets', on_delete=models.CASCADE)
    set_name = models.CharField(max_length=255)
    set_code = models.CharField(max_length=100)
    set_rarity = models.CharField(max_length=100)
    set_rarity_code = models.CharField(max_length=100)
    set_price = models.CharField(max_length=100)

class CardImage(models.Model):
    yugioh_card = models.ForeignKey(YugiohCard, related_name='card_images', on_delete=models.CASCADE)
    image_url = models.URLField()
    image_url_small = models.URLField()
    image_url_cropped = models.URLField()

class CardPrice(models.Model):
    yugioh_card = models.ForeignKey(YugiohCard, related_name='card_prices', on_delete=models.CASCADE)
    cardmarket_price = models.CharField(max_length=100)
    tcgplayer_price = models.CharField(max_length=100)
    ebay_price = models.CharField(max_length=100)
    amazon_price = models.CharField(max_length=100)
    coolstuffinc_price = models.CharField(max_length=100)



####################################################
# Pokemon Tables
####################################################
class PokemonAbility(models.Model):
    name = models.CharField(max_length=255)
    text = models.TextField()
    type = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class PokemonAttack(models.Model):
    name = models.CharField(max_length=255)
    cost = models.JSONField()
    convertedEnergyCost = models.IntegerField()
    damage = models.CharField(max_length=255)
    text = models.TextField(null=True)

    def __str__(self):
        return self.name

class PokemonWeakness(models.Model):
    type = models.CharField(max_length=100)
    value = models.CharField(max_length=100)

    def __str__(self):
        return f'{self.type} {self.value}'

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
        return self.name

class PokemonTcgplayer(models.Model):
    url = models.URLField(max_length=255)
    updatedAt = models.DateTimeField(null=True)
    prices = models.JSONField()

class PokemonCardmarket(models.Model):
    url = models.URLField(max_length=255)
    updatedAt = models.DateTimeField(null=True)
    prices = models.JSONField()

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
        return self.name



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
        return self.name
    


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
        return self.name

class MTGCardsData(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    oracle_id = models.UUIDField()
    name = models.CharField(max_length=200)
    lang = models.CharField(max_length=2)
    released_at = models.DateField()
    uri = models.URLField()
    layout = models.CharField(max_length=100)
    image_uris = models.JSONField(blank=True, null=True)
    cmc = models.DecimalField(max_digits=10, decimal_places=2)
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
        return self.name
    
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
        return self.name
    


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

    @property
    def card_market_value(self):
        """
        Returns the market value of the card from the appropriate card type.
        This assumes each card type has a `cardmarket` attribute with `prices.averageSellPrice`.
        """
        if self.pokemon_card and self.pokemon_card.cardmarket:
            return self.pokemon_card.cardmarket.prices.get('averageSellPrice', {})
        return Decimal('0.00')

    def save(self, *args, **kwargs):
        self.market_value = self.card_market_value or Decimal('0.00')
        super().save(*args, **kwargs)

CardList.cards = models.ManyToManyField('app_name.PokemonCardData', through='app_name.ListCard', related_name='card_lists')
CardList.yugioh_cards = models.ManyToManyField('app_name.YugiohCard', through='app_name.ListCard', related_name='yugioh_card_lists')
CardList.mtg_cards = models.ManyToManyField('app_name.MTGCardsData', through='app_name.ListCard', related_name='mtg_card_lists')
CardList.lorcana_cards = models.ManyToManyField('app_name.LorcanaCardData', through='app_name.ListCard', related_name='lorcana_card_lists')