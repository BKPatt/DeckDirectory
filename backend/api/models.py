from django.db import models

class CardList(models.Model):
    id = models.AutoField
    created_by = models.CharField(max_length=255)
    created_on = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    market_value = models.DecimalField(max_digits=10, decimal_places=2)
    cards = models.ForeignKey

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