from django.db import models


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
class PokemonWeakness(models.Model):
    type = models.CharField(max_length=100)
    value = models.CharField(max_length=100)

    def __str__(self):
        return f'{self.type}: {self.value}'
    
class PokemonCardSet(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    series = models.CharField(max_length=200)
    printedTotal = models.IntegerField()
    total = models.IntegerField()
    legalities = models.JSONField()
    ptcgoCode = models.CharField(max_length=100)
    releaseDate = models.DateField(null=True)
    updatedAt = models.DateTimeField(null=True)
    symbol = models.CharField(max_length=200)
    logo = models.CharField(max_length=200)

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

class PokemonCardData(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    supertype = models.CharField(max_length=100)
    subtypes = models.JSONField()
    level = models.CharField(max_length=50)
    hp = models.CharField(max_length=50)
    types = models.JSONField()
    attacks = models.ManyToManyField(PokemonAttack)
    weaknesses = models.ManyToManyField(PokemonWeakness)
    retreatCost = models.JSONField()
    convertedRetreatCost = models.IntegerField()
    set = models.ForeignKey(PokemonCardSet, on_delete=models.CASCADE, null=True)
    number = models.CharField(max_length=50)
    artist = models.CharField(max_length=200)
    rarity = models.CharField(max_length=100)
    flavorText = models.TextField()
    nationalPokedexNumbers = models.JSONField()
    legalities = models.JSONField()
    images = models.JSONField()
    tcgplayer = models.JSONField(null=True, blank=True)
    cardmarket = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name
