from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CardListViewSet, add_card_to_list, update_card_quantity, delete_card_from_list, get_list_by_id, update_list, add_card_to_collection
from .viewsOrganized.pokemon import get_pokemon_cards_by_list, pokemon_cards_api, get_filter_options
from .viewsOrganized.ebay import fetch_ebay_data
from .viewsOrganized.yugioh import fetch_yugioh_cards, get_yugioh_cards_by_list, get_yugioh_filter_options
from .viewsOrganized.mtg import get_mtg_cards_by_list, fetch_mtg_cards, get_mtg_filter_options
from .viewsOrganized.lorcana import get_lorcana_cards_by_list, fetch_lorcana_cards, get_lorcana_filter_options

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
    path('cards-by-list/<int:list_id>/', get_pokemon_cards_by_list, name='cards-by-list'),
    path('yugioh-cards-by-list/<int:list_id>/', get_yugioh_cards_by_list, name='yugioh-cards-by-list'),
    path('mtg-cards-by-list/<int:list_id>/', get_mtg_cards_by_list, name='mtg-cards-by-list'),
    path('lorcana-cards-by-list/<int:list_id>/', get_lorcana_cards_by_list, name='lorcana-cards-by-list'),
    path('update-card-quantity/', update_card_quantity, name='update-card-quantity'),
    path('delete-card-from-list/', delete_card_from_list, name='delete-card-from-list'),
    path('get-list-by-id/<int:list_id>/', get_list_by_id, name='get-list-by-id'),
    path('card-lists/update/<int:list_id>/', update_list, name='update-list'),
    path('filter-options/', get_filter_options, name='filter-options'),
    path('mtg-filter-options/', get_mtg_filter_options, name='mtg-filter-options'),
    path('yugioh-filter-options/', get_yugioh_filter_options, name='yugioh-filter-options'),
    path('lorcana-filter-options/', get_lorcana_filter_options, name='lorcana-filter-options'),
    path('add-card-to-collection/', add_card_to_collection, name='add-card-to-collection'),
]
