from rest_framework import viewsets
from .models import CardList
from .serializers import CardListSerializer

class CardListViewSet(viewsets.ModelViewSet):
    queryset = CardList.objects.all()
    serializer_class = CardListSerializer
