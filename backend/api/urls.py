from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CardListViewSet
from .views import fetch_ebay_data
from .views import fetch_yugioh_cards

router = DefaultRouter()
router.register(r'cardlists', CardListViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('fetch-ebay-data/', fetch_ebay_data, name='fetch_ebay_data'),
    path('fetch-yugioh-cards/', fetch_yugioh_cards, name='fetch_yugioh_cards'),
]
