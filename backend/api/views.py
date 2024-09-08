from decimal import Decimal, InvalidOperation
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
from django.db.models import Count, DecimalField
from django.db.models.functions import Cast

logger = logging.getLogger(__name__)

def calculate_average_price(prices):
    """
    Calculate the average price of a card by filtering outliers based on IQR (Interquartile Range).
    Returns Decimal('0.00') if no valid prices are available.
    """
    if not prices:
        return Decimal('0.00')

    # Sort prices to calculate Q1 (first quartile) and Q3 (third quartile)
    prices = sorted(Decimal(str(price)) for price in prices if price)
    mid_index = len(prices) // 2
    Q1 = prices[mid_index // 2] if len(prices) % 2 else (prices[mid_index // 2 - 1] + prices[mid_index // 2]) / 2
    Q3 = prices[-(mid_index // 2) - 1] if len(prices) % 2 else (prices[-(mid_index // 2) - 1] + prices[-(mid_index // 2)]) / 2
    IQR = Q3 - Q1  # Interquartile Range

    # Define lower and upper bounds for filtering prices
    lower_bound = Q1 - (Decimal('1.5') * IQR)
    upper_bound = Q3 + (Decimal('1.5') * IQR)
    filtered_prices = [price for price in prices if lower_bound <= price <= upper_bound]

    # Calculate average price
    try:
        average = sum(filtered_prices) / Decimal(len(filtered_prices))
    except (InvalidOperation, ZeroDivisionError, TypeError):
        average = Decimal('0.00')

    return average

def get_card_market_price(card, card_type):
    """
    Get the market price of a card based on its type (Pokemon, Yu-Gi-Oh!, MTG, or Lorcana).
    Uses prices from external sources like TCGPlayer or CardMarket.
    """
    logger.info(f"Getting market price for {card_type} card: {card.id}")
    
    if card_type == 'pokemon':
        price_values = []
        # Collect prices from TCGPlayer and CardMarket if available
        if card.tcgplayer and card.tcgplayer.prices:
            price_values.append(card.tcgplayer.prices.get('trendPrice', 0))
            price_values.append(card.tcgplayer.prices.get('reverseHoloTrend', 0))
        if card.cardmarket and card.cardmarket.prices:
            price_values.append(card.cardmarket.prices.get('averageSellPrice', 0))
        price = calculate_average_price([Decimal(str(price)) for price in price_values if price is not None])
        logger.info(f"Pokemon card price: {price}")
        return price

    elif card_type == 'yugioh':
        price_values = []
        # Collect prices from various sources like eBay, Amazon, and TCGPlayer
        prices = card.card_prices.all()
        for price in prices:
            if price.cardmarket_price:
                price_values.append(Decimal(price.cardmarket_price))
            if price.ebay_price:
                price_values.append(Decimal(price.ebay_price))
            if price.amazon_price:
                price_values.append(Decimal(price.amazon_price))
            if price.tcgplayer_price:
                price_values.append(Decimal(price.tcgplayer_price))
            if price.coolstuffinc_price:
                price_values.append(Decimal(price.coolstuffinc_price))
        price = calculate_average_price(price_values)
        logger.info(f"Yu-Gi-Oh! card price: {price}")
        return price

    elif card_type == 'mtg':
        # Use the USD price from the card's price data if available
        if card.prices and 'usd' in card.prices:
            try:
                price = Decimal(card.prices['usd'])
                logger.info(f"MTG card price: {price}")
                return price
            except (TypeError, ValueError) as e:
                logger.error(f"Error converting MTG card price: {e}")
                return Decimal('0.00')
        logger.warning("No price found for MTG card")
        return Decimal('0.00')

    elif card_type == 'lorcana':
        # Use the cost value from Lorcana cards if available
        try:
            price = Decimal(card.cost) if card.cost else Decimal('0.00')
            logger.info(f"Lorcana card price: {price}")
            return price
        except (TypeError, ValueError) as e:
            logger.error(f"Error converting Lorcana card price: {e}")
            return Decimal('0.00')

    logger.warning(f"Unknown card type: {card_type}")
    return Decimal('0.00')

def get_card_type_and_instance(list_card):
    """
    Determine the card type and return the corresponding card instance from a ListCard object.
    """
    if list_card.pokemon_card:
        return 'pokemon', list_card.pokemon_card
    elif list_card.yugioh_card:
        return 'yugioh', list_card.yugioh_card
    elif list_card.mtg_card:
        return 'mtg', list_card.mtg_card
    elif list_card.lorcana_card:
        return 'lorcana', list_card.lorcana_card
    else:
        return None, None

# Load environment variables from .env file for configuration
BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / '.env'
config = Config(RepositoryEnv(env_file))

class StandardResultsSetPagination(PageNumberPagination):
    """
    Custom pagination class to handle paginated responses for large datasets.
    Allows specifying page size and has a maximum limit on the number of results.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class CardListViewSet(viewsets.ModelViewSet):
    """
    ViewSet for listing, retrieving, and updating card lists.
    Supports filtering by card type and sorting by market value or number of cards.
    """
    queryset = CardList.objects.all().order_by('created_on')
    serializer_class = CardListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """
        Override default queryset to allow filtering by card type and sorting by various fields.
        """
        queryset = CardList.objects.all()
        card_type = self.request.query_params.get('type', None)

        if card_type:
            queryset = queryset.filter(type=card_type)

        # Sorting by market value or number of cards in the list
        sort_field = self.request.query_params.get('sort_field', 'created_on')
        sort_direction = self.request.query_params.get('sort_direction', 'asc')

        if sort_field == 'market_value':
            queryset = queryset.annotate(
                market_value_decimal=Cast('market_value', output_field=DecimalField(max_digits=10, decimal_places=2))
            )
            queryset = queryset.order_by('-market_value_decimal' if sort_direction == 'desc' else 'market_value_decimal')
        elif sort_field == 'num_cards':
            queryset = queryset.annotate(num_cards=Count('list_cards'))
            queryset = queryset.order_by('-num_cards' if sort_direction == 'desc' else 'num_cards')
        else:
            if sort_direction == 'desc':
                sort_field = '-' + sort_field
            queryset = queryset.order_by(sort_field)

        return queryset

@api_view(['POST'])
def add_card_to_list(request):
    """
    API endpoint to add a card to a list. Handles adding Pokemon, Yu-Gi-Oh!, MTG, or Lorcana cards.
    Updates the market value of the list based on the card's price.
    """
    try:
        list_id = request.data.get('list_id')
        card_id = request.data.get('card_id')
        card_type = request.data.get('card_type')
        updated_list = CardList.objects.get(id=list_id)

        # Determine card type and add to list
        if card_type == 'pokemon':
            card = PokemonCardData.objects.get(id=card_id)
            list_card = ListCard(card_list_id=list_id, pokemon_card=card)
            price_values = [
                card.tcgplayer.prices.get('trendPrice', 0) if card.tcgplayer else None,
                card.tcgplayer.prices.get('reverseHoloTrend', 0) if card.tcgplayer else None,
                card.cardmarket.prices.get('averageSellPrice', 0) if card.cardmarket else None
            ]
            average_market_price = calculate_average_price([Decimal(str(price)) for price in price_values if price])
            updated_list.market_value += average_market_price
        elif card_type == 'yugioh':
            card = YugiohCard.objects.get(id=card_id)
            list_card = ListCard(card_list_id=list_id, yugioh_card=card)
            prices = [Decimal(price.cardmarket_price or 0) for price in card.card_prices.all()]
            average_market_price = calculate_average_price(prices)
            updated_list.market_value += average_market_price
        elif card_type == 'mtg':
            card = MTGCardsData.objects.get(id=card_id)
            list_card = ListCard(card_list_id=list_id, mtg_card=card)
            market_value_increase = Decimal(card.prices.get('usd', 0)) if card.prices else Decimal('0.00')
            updated_list.market_value += market_value_increase
        elif card_type == 'lorcana':
            card = LorcanaCardData.objects.get(id=card_id)
            list_card = ListCard(card_list_id=list_id, lorcana_card=card)
            updated_list.market_value += Decimal(card.cost or '0.00')
        else:
            return Response({'error': 'Invalid card type'}, status=400)

        # Save the new card to the list and update the list's market value
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
    """
    API endpoint to increment or decrement the quantity of a card in a list.
    Updates the list's market value accordingly.
    """
    try:
        list_id = request.data.get('list_id')
        card_id = request.data.get('card_id')
        card_type = request.data.get('card_type')
        operation = request.data.get('operation')
        is_collected = request.data.get('is_collected', False)

        if not all([list_id, card_id, card_type, operation]):
            logger.error(f"Missing required parameters: list_id={list_id}, card_id={card_id}, card_type={card_type}, operation={operation}")
            return Response({'error': 'Missing required parameters'}, status=400)

        updated_list = CardList.objects.get(id=list_id)
        card_key = f"{card_type}_card_id"
        list_cards = ListCard.objects.filter(card_list_id=list_id, **{card_key: card_id})

        card_model = {
            'pokemon': PokemonCardData,
            'yugioh': YugiohCard,
            'mtg': MTGCardsData,
            'lorcana': LorcanaCardData
        }.get(card_type)

        if not card_model:
            return Response({'error': 'Invalid card type'}, status=400)

        try:
            card = card_model.objects.get(id=card_id)
        except card_model.DoesNotExist:
            return Response({'error': f'{card_type.capitalize()} card not found'}, status=404)

        price_change = get_card_market_price(card, card_type)

        if operation == 'increment':
            # Add a new card instance to the list
            new_card = ListCard(card_list_id=list_id, **{f"{card_type}_card": card})
            new_card.save()
            updated_list.market_value += price_change
        elif operation == 'decrement' and list_cards.exists():
            # Remove a card instance from the list
            card_to_remove = list_cards.first()
            if is_collected and card_to_remove.collected:
                card_to_remove.collected = False
                card_to_remove.save()
            else:
                card_to_remove.delete()
            updated_list.market_value = max(Decimal('0.00'), updated_list.market_value - price_change)
        else:
            return Response({'error': 'Invalid operation'}, status=400)

        updated_list.save()
        return Response({'message': 'Card quantity updated successfully'})

    except Exception as e:
        logger.error(f"Error updating card quantity: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['DELETE'])
def delete_card_from_list(request):
    """
    API endpoint to delete a card from a list. Updates the list's market value accordingly.
    """
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
    """
    API endpoint to retrieve details of a card list by its ID, including all cards in the list.
    Also calculates the total market value and collection value of the list.
    """
    try:
        card_list = CardList.objects.prefetch_related('list_cards').get(id=list_id)

        list_cards = card_list.list_cards.all()
        list_card_data = []
        collection_value = Decimal('0.00')
        market_value = Decimal('0.00')

        # Loop through each card in the list and calculate its market and collection values
        for list_card in list_cards:
            card_type, card_instance = get_card_type_and_instance(list_card)
            if card_instance is None:
                continue

            card_price = get_card_market_price(card_instance, card_type)
            market_value += card_price

            if list_card.collected:
                collection_value += card_price

            list_card_data.append({
                'id': list_card.id,
                'card_type': card_type,
                'card_id': card_instance.id,
                'market_value': str(card_price),
                'collected': list_card.collected,
                'card_type_rarity': getattr(list_card, 'card_type', None),
            })

        # Update market and collection values of the list
        card_list.market_value = market_value
        card_list.collection_value = collection_value
        card_list.save()

        card_list_data = {
            'id': card_list.id,
            'created_by': card_list.created_by,
            'created_on': card_list.created_on,
            'name': card_list.name,
            'type': card_list.type,
            'market_value': str(market_value),
            'collection_value': str(collection_value),
            'needs_update': card_list.needs_update
        }

        response_data = {
            'card_list': card_list_data,
            'list_cards': list_card_data
        }

        return Response(response_data)

    except CardList.DoesNotExist:
        return Response({'error': 'CardList not found'}, status=404)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def update_list(request, list_id):
    """
    API endpoint to update the details of a card list, including adding or removing cards.
    """
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

        # Use a database transaction to ensure data integrity when updating the list
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

@api_view(['POST'])
def card_collection(request):
    """
    API endpoint to add or remove a card from the collection status in a list.
    Updates the collection value of the list accordingly.
    """
    logger.info(f"Received card collection request: {request.data}")
    with transaction.atomic():
        try:
            list_id = request.data.get('list_id')
            card_id = request.data.get('card_id')
            card_type = request.data.get('card_type')
            operation = request.data.get('operation')

            logger.info(f"Processing request - list_id: {list_id}, card_id: {card_id}, card_type: {card_type}, operation: {operation}")

            if not all([list_id, card_id, card_type, operation]):
                logger.error("Missing required parameters")
                return Response({'error': 'Missing required parameters'}, status=400)

            try:
                card_list = CardList.objects.get(id=list_id)
            except CardList.DoesNotExist:
                logger.error(f"CardList not found: list_id={list_id}")
                return Response({'error': 'CardList not found'}, status=404)

            card_key = f"{card_type}_card_id"
            list_cards = ListCard.objects.filter(card_list=card_list, **{card_key: card_id})

            if not list_cards.exists():
                logger.error(f"Card not found in the list: card_id={card_id}, card_type={card_type}")
                return Response({'error': 'Card not found in the list'}, status=404)

            card_model = {
                'pokemon': PokemonCardData,
                'yugioh': YugiohCard,
                'mtg': MTGCardsData,
                'lorcana': LorcanaCardData
            }.get(card_type)

            if not card_model:
                logger.error(f"Invalid card type: {card_type}")
                return Response({'error': 'Invalid card type'}, status=400)

            try:
                card = card_model.objects.get(id=card_id)
            except card_model.DoesNotExist:
                logger.error(f"{card_type.capitalize()} card not found: card_id={card_id}")
                return Response({'error': f'{card_type.capitalize()} card not found'}, status=404)

            card_price = get_card_market_price(card, card_type)
            logger.info(f"Card price: {card_price}")

            if operation == 'add':
                uncollected_card = list_cards.filter(collected=False).first()
                if uncollected_card:
                    uncollected_card.collected = True
                    uncollected_card.save()
                    card_list.collection_value += card_price
                    card_list.save()
                    logger.info(f"Card added to collection: card_id={card_id}")
                else:
                    logger.warning("All instances of the card are already collected")
                    return Response({'error': 'All instances of the card are already collected'}, status=400)
            elif operation == 'remove':
                collected_card = list_cards.filter(collected=True).first()
                if collected_card:
                    collected_card.collected = False
                    collected_card.save()
                    card_list.collection_value = max(Decimal('0.00'), card_list.collection_value - card_price)
                    card_list.save()
                    logger.info(f"Card removed from collection: card_id={card_id}")
                else:
                    logger.warning("No collected instances of the card found")
                    return Response({'error': 'No collected instances of the card found'}, status=400)
            else:
                logger.error(f"Invalid operation: {operation}")
                return Response({'error': 'Invalid operation'}, status=400)

            return Response({'message': 'Card collection status updated successfully.'})

        except Exception as e:
            logger.error(f"Error updating card collection: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=500)
    
@api_view(['POST'])
def set_card_quantity(request):
    """
    API endpoint to set the collection status of a card in a list.
    """
    with transaction.atomic():
        try:
            list_id = request.data.get('list_id')
            card_id = request.data.get('card_id')
            card_type = request.data.get('card_type')
            new_collected_status = request.data.get('collected', False)

            if not all([list_id, card_id, card_type]):
                return Response({'error': 'Missing required parameters'}, status=400)

            card_list = CardList.objects.get(id=list_id)
            list_cards = ListCard.objects.filter(card_list_id=list_id, **{f"{card_type}_card_id": card_id})

            if not list_cards.exists():
                return Response({'error': 'Card not found in the list'}, status=404)

            # Update collection status
            if new_collected_status:
                uncollected_card = list_cards.filter(collected=False).first()
                if uncollected_card:
                    uncollected_card.collected = True
                    uncollected_card.save()
            else:
                collected_cards = list_cards.filter(collected=True)
                collected_cards.update(collected=False)

            return Response({'message': 'Card quantities updated successfully.'})

        except CardList.DoesNotExist:
            return Response({'error': 'CardList not found'}, status=404)
        except Exception as e:
            logger.error(f"Error setting card quantity: {e}")
            return Response({'error': str(e)}, status=500)
