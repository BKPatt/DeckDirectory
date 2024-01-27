from decimal import Decimal
from pathlib import Path
from rest_framework import viewsets
from .models import CardList, LorcanaCardData, MTGCardsData, YugiohCard, PokemonCardData, ListCard
from .serializers import CardListSerializer, ListCardSerializer
from decouple import Config, RepositoryEnv
import logging
from rest_framework.decorators import api_view
from django.db import transaction
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count

BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / '.env'
config = Config(RepositoryEnv(env_file))
logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class CardListViewSet(viewsets.ModelViewSet):
    queryset = CardList.objects.all().order_by('created_on')
    serializer_class = CardListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = CardList.objects.all()
        card_type = self.request.query_params.get('type', None)

        if card_type is not None:
            if card_type.lower() == 'pokemon':
                queryset = queryset.filter(type=card_type)
            elif card_type.lower() == 'yu-gi-oh!':
                queryset = queryset.filter(type=card_type)
            elif card_type.lower() == 'mtg':
                queryset = queryset.filter(type=card_type)
            elif card_type.lower() == 'lorcana':
                queryset = queryset.filter(type=card_type)
            elif card_type.lower() == 'baseball':
                queryset = queryset.filter(type=card_type)
            elif card_type.lower() == 'football':
                queryset = queryset.filter(type=card_type)
            elif card_type.lower() == 'basketball':
                queryset = queryset.filter(type=card_type)
            elif card_type.lower() == 'hockey':
                queryset = queryset.filter(type=card_type)

        sort_field = self.request.query_params.get('sort_field', 'created_on')
        sort_direction = self.request.query_params.get('sort_direction', 'asc')

        if sort_field == 'num_cards':
            queryset = queryset.annotate(num_cards=Count('list_cards'))
            if sort_direction == 'desc':
                queryset = queryset.order_by('-num_cards')
            else:
                queryset = queryset.order_by('num_cards')
        else:
            if sort_direction == 'desc':
                sort_field = '-' + sort_field
            queryset = queryset.order_by(sort_field)

        return queryset

@api_view(['POST'])
def add_card_to_list(request):
    try:
        list_id = request.data.get('list_id')
        card_id = request.data.get('card_id')
        card_type = request.data.get('card_type')
        updated_list = CardList.objects.get(id=list_id)

        if card_type == 'pokemon':
            card = PokemonCardData.objects.get(id=card_id)
            list_card = ListCard(card_list_id=list_id, pokemon_card=card)

            market_value_increase = 0
            if card.cardmarket and card.cardmarket.prices:
                market_value_increase = Decimal(card.cardmarket.prices.get('averageSellPrice', {}))

            updated_list.market_value += market_value_increase
        elif card_type == 'yugioh':
            card = YugiohCard.objects.get(id=card_id)
            list_card = ListCard(card_list_id=list_id, yugioh_card=card)

            print(card)
            print(card.card_sets.all())
            print(card.card_prices.all())

            prices = card.card_prices.all()
            if prices.exists():
                total_market_price = sum(Decimal(price.cardmarket_price or 0) for price in prices)
                average_market_price = total_market_price / len(prices)
                updated_list.market_value += average_market_price
            else:
                print("No cardmarket price data available for this card")
        elif card_type == 'mtg':
            card = MTGCardsData.objects.get(id=card_id)
            list_card = ListCard(card_list_id=list_id, mtg_card=card)

            print(card)
            print(card.card_faces.all())

            market_value_increase = 0
            if card.prices:
                market_value_increase = Decimal(card.prices.get('usd', {}))

            updated_list.market_value += market_value_increase
        elif card_type == 'lorcana':
            card = LorcanaCardData.objects.get(id=card_id)
            list_card = ListCard(card_list_id=list_id, lorcana_card=card)

            print(card)

            market_value_increase = 0
            if card.cost:
                market_value_increase = Decimal(card.cost)

            updated_list.market_value += market_value_increase
        else:
            return Response({'error': 'Invalid card type'}, status=400)

        list_card.save()

        updated_list.save()
        card_count = updated_list.list_cards.count()

        response_data = {
            'card_added': ListCardSerializer(list_card).data,
            'new_card_count': card_count
        }

        return Response(response_data)

    except Exception as e:
        logger.error(f"Error adding card to list: {e}")
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
def update_card_quantity(request):
    try:
        list_id = request.data.get('list_id')
        card_id = request.data.get('card_id')
        card_type = request.data.get('card_type')
        operation = request.data.get('operation')

        if not all([list_id, card_id, card_type, operation]):
            logger.error(f"Missing required parameters: list_id={list_id}, card_id={card_id}, card_type={card_type}, operation={operation}")
            return Response({'error': 'Missing required parameters'}, status=400)

        card_key = f"{card_type}_card_id"
        list_cards = ListCard.objects.filter(card_list_id=list_id, **{card_key: card_id})

        if card_type == 'pokemon':
            card = PokemonCardData.objects.get(id=card_id)
            price_change = 0
            if card.cardmarket and card.cardmarket.prices:
                price_change = Decimal(card.cardmarket.prices.get('averageSellPrice', 0))

            if operation == 'increment':
                new_card = ListCard(card_list_id=list_id, **{f"{card_type}_card": card})
                new_card.save()
                updated_list.market_value += price_change
            elif operation == 'decrement' and list_cards.exists():
                list_cards.first().delete()
                updated_list.market_value -= price_change
            else:
                return Response({'error': 'Invalid operation'}, status=400)
        elif card_type == 'yugioh':
            card = YugiohCard.objects.get(id=card_id)
        elif card_type == 'mtg':
            card = MTGCardsData.objects.get(id=card_id)
            price_change = 0
            if card.prices:
                price_change = Decimal(card.prices.get('usd', 0))

            if operation == 'increment':
                new_card = ListCard(card_list_id=list_id, **{f"{card_type}_card": card})
                new_card.save()
                updated_list.market_value += price_change
            elif operation == 'decrement' and list_cards.exists():
                list_cards.first().delete()
                updated_list.market_value -= price_change
            else:
                return Response({'error': 'Invalid operation'}, status=400)
        elif card_type == 'lorcana':
            card = LorcanaCardData.objects.get(id=card_id)
            price_change = 0
            if card.cost:
                price_change = Decimal(card.cost)

            if operation == 'increment':
                new_card = ListCard(card_list_id=list_id, **{f"{card_type}_card": card})
                new_card.save()
                updated_list.market_value += price_change
            elif operation == 'decrement' and list_cards.exists():
                list_cards.first().delete()
                updated_list.market_value -= price_change
            else:
                return Response({'error': 'Invalid operation'}, status=400)
        else:
            return Response({'error': 'Invalid card type'}, status=400)

        updated_list = CardList.objects.get(id=list_id)
        updated_list.save()
        return Response({'message': 'Card quantity updated successfully'})

    except ObjectDoesNotExist:
        logger.error(f"Card not found: card_id={card_id}, card_type={card_type}")
        return Response({'error': 'Card not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating card quantity: {e}")
        return Response({'error': str(e)}, status=500)
    
@api_view(['DELETE'])
def delete_card_from_list(request):
    try:
        list_id = request.data.get('list_id')
        card_id = request.data.get('card_id')
        card_type = request.data.get('card_type')

        if not all([list_id, card_id, card_type]):
            logger.error(f"Missing required parameters: list_id={list_id}, card_id={card_id}, card_type={card_type}")
            return Response({'error': 'Missing required parameters'}, status=400)

        card_key = f"{card_type}_card_id"
        list_card = ListCard.objects.filter(card_list_id=list_id, **{card_key: card_id}).first()

        if list_card:
            updated_list = CardList.objects.get(id=list_id)
            
            market_value_decrease = Decimal(0)
            if card_type == 'pokemon':
                card = PokemonCardData.objects.get(id=card_id)
                if card.cardmarket and card.cardmarket.prices:
                    market_value_decrease = Decimal(card.cardmarket.prices.get('averageSellPrice', 0))
            elif card_type == 'yugioh':
                card = YugiohCard.objects.get(id=card_id)
                prices = card.card_prices.all()
                if prices.exists():
                    total_market_price = sum(Decimal(price.cardmarket_price or 0) for price in prices)
                    average_market_price = total_market_price / len(prices)
                    market_value_decrease = average_market_price
            elif card_type == 'mtg':
                card = MTGCardsData.objects.get(id=card_id)
                if card.prices:
                    market_value_decrease = Decimal(card.prices.get('usd', 0))
            elif card_type == 'lorcana':
                card = LorcanaCardData.objects.get(id=card_id)
                if card.cost:
                    market_value_decrease = Decimal(card.cost)

            updated_list.market_value -= market_value_decrease
            updated_list.save()
            
            list_card.delete()
            return Response({'message': 'Card deleted from list successfully'})
        else:
            return Response({'error': 'Card not found in the list'}, status=404)

    except Exception as e:
        logger.error(f"Error deleting card from list: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_list_by_id(request, list_id):
    try:
        card_list = CardList.objects.prefetch_related('list_cards').get(id=list_id)

        card_list_data = CardListSerializer(card_list).data

        list_cards = card_list.list_cards.all()
        list_card_data = [ListCardSerializer(card).data for card in list_cards]

        response_data = {
            'card_list': card_list_data,
            'list_cards': list_card_data
        }

        return Response(response_data)

    except CardList.DoesNotExist:
        logger.error(f"CardList not found: list_id={list_id}")
        return Response({'error': 'CardList not found'}, status=404)
    except Exception as e:
        logger.error(f"Error retrieving list by ID: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def update_list(request, list_id):
    try:
        try:
            card_list = CardList.objects.get(id=list_id)
        except CardList.DoesNotExist:
            card_list = CardList(id=list_id)
            card_list.save()
            
        new_name = request.data.get('name')
        new_type = request.data.get('type')
        if new_name:
            card_list.name = new_name
        if new_type:
            card_list.type = new_type
        add_cards = request.data.get('add_cards')
        remove_cards = request.data.get('remove_cards')
        with transaction.atomic():
            if add_cards:
                for card_data in add_cards:
                    card_id = card_data.get('card_id')
                    card_type = card_data.get('card_type')
                    if card_type == 'pokemon':
                        card = PokemonCardData.objects.get(id=card_id)
                        list_card = ListCard(card_list=card_list, pokemon_card=card)
                    elif card_type == 'yugioh':
                        card = YugiohCard.objects.get(id=card_id)
                        list_card = ListCard(card_list=card_list, yugioh_card=card)
                    elif card_type == 'mtg':
                        card = MTGCardsData.objects.get(id=card_id)
                        list_card = ListCard(card_list=card_list, mtg_card=card)
                    elif card_type == 'lorcana':
                        card = LorcanaCardData.objects.get(id=card_id)
                        list_card = ListCard(card_list=card_list, lorcana_card=card)
                    list_card.save()
            if remove_cards:
                for card_id in remove_cards:
                    ListCard.objects.filter(card_list=card_list, id=card_id).delete()
            card_list.save()
        return Response({'message': 'List updated successfully'})
    except CardList.DoesNotExist:
        return Response({'error': 'CardList not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating list: {e}")
        return Response({'error': str(e)}, status=500)