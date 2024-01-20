from pathlib import Path
from django.http import JsonResponse
import requests
from rest_framework import viewsets
from .models import CardList, YugiohCard, PokemonCardData
from .serializers import CardListSerializer
from decouple import Config, RepositoryEnv
import logging
from django.core.paginator import Paginator, EmptyPage

BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / '.env'
config = Config(RepositoryEnv(env_file))
logger = logging.getLogger(__name__)

class CardListViewSet(viewsets.ModelViewSet):
    queryset = CardList.objects.all()
    serializer_class = CardListSerializer

def fetch_ebay_data(request):
    try:
        search_term = request.GET.get('searchTerm', 'default search term')
        url = "https://svcs.sandbox.ebay.com/services/search/FindingService/v1"
        params = {
            'OPERATION-NAME': 'findItemsByKeywords',
            'SERVICE-VERSION': '1.0.0',
            'SECURITY-APPNAME': config('EBAY_API_KEY'),
            'RESPONSE-DATA-FORMAT': 'JSON',
            'REST-PAYLOAD': '',
            'keywords': search_term
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        return JsonResponse(response.json())
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def fetch_yugioh_cards(request):
    try:
        search_term = request.GET.get('name', '')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))

        if search_term:
            cards = YugiohCard.objects.filter(name__icontains=search_term)
        else:
            cards = YugiohCard.objects.all()

        paginator = Paginator(cards, page_size)
        current_page = paginator.page(page)

        card_list = []
        for card in current_page:
            card_data = {
                'id': card.id,
                'name': card.name,
                'type': card.card_type,
                'frameType': card.frame_type,
                'desc': card.description,
                'atk': card.attack,
                'def': card.defense,
                'level': card.level,
                'race': card.race,
                'attribute': card.attribute,
                'card_sets': list(card.card_sets.values()),
                'card_images': list(card.card_images.values()),
                'card_prices': list(card.card_prices.values()),
            }
            card_list.append(card_data)

        response_data = {
            'data': card_list,
            'total_pages': paginator.num_pages
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def pokemon_cards_api(request):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        search_term = request.GET.get('search', '')

        if search_term:
            cards_query = PokemonCardData.objects.filter(name__icontains=search_term).order_by('id')
        else:
            cards_query = PokemonCardData.objects.all().order_by('id')

        paginator = Paginator(cards_query, page_size)
        try:
            current_page = paginator.page(page)
        except EmptyPage:
            return JsonResponse({'error': 'Page not found'}, status=404)

        serialized_cards = []
        for card in current_page:
            card_dict = {
                'id': card.id,
                'name': card.name,
                'supertype': card.supertype,
                'subtypes': card.subtypes,
                'level': card.level,
                'hp': card.hp,
                'types': card.types,
                'retreatCost': card.retreatCost,
                'convertedRetreatCost': card.convertedRetreatCost,
                'number': card.number,
                'artist': card.artist,
                'rarity': card.rarity,
                'flavorText': card.flavorText,
                'nationalPokedexNumbers': card.nationalPokedexNumbers,
                'legalities': card.legalities,
                'images': card.images,
                'tcgplayer': card.tcgplayer,
                'cardmarket': card.cardmarket,
                'attacks': [{'name': attack.name, 'cost': attack.cost, 'convertedEnergyCost': attack.convertedEnergyCost, 'damage': attack.damage, 'text': attack.text} for attack in card.attacks.all()],
                'weaknesses': [{'type': weakness.type, 'value': weakness.value} for weakness in card.weaknesses.all()],
                'set': {
                    'id': card.set.id,
                    'name': card.set.name,
                    'series': card.set.series,
                    'printedTotal': card.set.printedTotal,
                    'total': card.set.total,
                    'legalities': card.set.legalities,
                    'ptcgoCode': card.set.ptcgoCode,
                    'releaseDate': card.set.releaseDate,
                    'updatedAt': card.set.updatedAt,
                    'symbol': card.set.symbol,
                    'logo': card.set.logo,
                } if card.set else None,
            }
            serialized_cards.append(card_dict)

        return JsonResponse({
            'data': serialized_cards,
            'total_pages': paginator.num_pages
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)