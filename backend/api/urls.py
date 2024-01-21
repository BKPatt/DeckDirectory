from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CardListViewSet, add_card_to_list, fetch_mtg_cards
from .views import fetch_ebay_data
from .views import fetch_yugioh_cards
from .views import pokemon_cards_api
from .views import fetch_lorcana_cards

router = DefaultRouter()
router.register(r'cardlists', CardListViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('fetch-ebay-data/', fetch_ebay_data, name='fetch_ebay_data'),
    path('fetch-yugioh-cards/', fetch_yugioh_cards, name='fetch_yugioh_cards'),
    path('pokemon-cards/', pokemon_cards_api, name='pokemon-cards-api'),
    path('lorcana-cards/', fetch_lorcana_cards, name='fetch_lorcana_cards'),
    path('mtg-cards/', fetch_mtg_cards, name='fetch_mtg_cards'),
    path('add-card-to-list/', add_card_to_list, name='add-card-to-list'),
]
