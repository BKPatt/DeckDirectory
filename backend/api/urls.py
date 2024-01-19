from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CardListViewSet

router = DefaultRouter()
router.register(r'cardlists', CardListViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
