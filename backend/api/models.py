from django.db import models

class CardList(models.Model):
    id = models.AutoField
    created_by = models.CharField(max_length=255)
    created_on = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    market_value = models.DecimalField(max_digits=10, decimal_places=2)
    cards = models.ForeignKey