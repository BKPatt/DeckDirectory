from pathlib import Path
from django.http import JsonResponse
import requests
from rest_framework import viewsets
from .models import MTGCardFace, CardList, LorcanaCardData, MTGCardsData, MTGRelatedCard, YugiohCard, PokemonCardData, ListCard
from .serializers import CardListSerializer, ListCardSerializer
from decouple import Config, RepositoryEnv
import logging
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response

BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / '.env'
config = Config(RepositoryEnv(env_file))
logger = logging.getLogger(__name__)

class CardListViewSet(viewsets.ModelViewSet):
    queryset = CardList.objects.all()
    serializer_class = CardListSerializer

@api_view(['POST'])
def add_card_to_list(request):
    try:
        list_id = request.data.get('list_id')
        card_id = request.data.get('card_id')
        card_type = request.data.get('card_type')

        if card_type == 'pokemon':
            card = PokemonCardData.objects.get(id=card_id)
            list_card = ListCard(card_list_id=list_id, pokemon_card=card)
        elif card_type == 'yugioh':
            card = YugiohCard.objects.get(id=card_id)
            list_card = ListCard(card_list_id=list_id, yugioh_card=card)

        list_card.save()
        serializer = ListCardSerializer(list_card)
        return Response(serializer.data)

    except Exception as e:
        return Response({'error': str(e)}, status=400)

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
            cards = YugiohCard.objects.filter(name__icontains=search_term).order_by('card_sets__set_code', 'id')
        else:
            cards = YugiohCard.objects.all().order_by('card_sets__set_code', 'id')

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
            cards_query = PokemonCardData.objects.filter(name__icontains=search_term).order_by('set__releaseDate', 'id')
        else:
            cards_query = PokemonCardData.objects.all().order_by('set__releaseDate', 'id')

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
                'evolvesFrom': card.evolvesFrom,
                'retreatCost': card.retreatCost,
                'convertedRetreatCost': card.convertedRetreatCost,
                'number': card.number,
                'artist': card.artist,
                'rules': card.rules,
                'rarity': card.rarity,
                'flavorText': card.flavorText,
                'nationalPokedexNumbers': card.nationalPokedexNumbers,
                'legalities': card.legalities,
                'images': card.images,
                'tcgplayer': {
                    'url': card.tcgplayer.url,
                    'updatedAt': card.tcgplayer.updatedAt,
                    'prices': card.tcgplayer.prices
                } if card.tcgplayer else None,
                'cardmarket': {
                    'url': card.cardmarket.url,
                    'updatedAt': card.cardmarket.updatedAt,
                    'prices': card.cardmarket.prices
                } if card.cardmarket else None,
                'abilities': [
                    {
                        'name': ability.name,
                        'text': ability.text,
                        'type': ability.type
                    }
                    for ability in card.abilities.all()
                ],
                'attacks': [
                    {
                        'name': attack.name,
                        'cost': attack.cost,
                        'convertedEnergyCost': attack.convertedEnergyCost,
                        'damage': attack.damage,
                        'text': attack.text
                    }
                    for attack in card.attacks.all()
                ],
                'weaknesses': [
                    {
                        'type': weakness.type,
                        'value': weakness.value
                    }
                    for weakness in card.weaknesses.all()
                ],
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
                    'images': card.set.images
                } if card.set else None,
            }
            serialized_cards.append(card_dict)

        return JsonResponse({
            'data': serialized_cards,
            'total_pages': paginator.num_pages
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def fetch_lorcana_cards(request):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        search_term = request.GET.get('search', '')

        if search_term:
            cards_query = LorcanaCardData.objects.filter(name__icontains=search_term).order_by('id')
        else:
            cards_query = LorcanaCardData.objects.all().order_by('id')

        paginator = Paginator(cards_query, page_size)
        try:
            current_page = paginator.page(page)
        except EmptyPage:
            return JsonResponse({'error': 'Page not found'}, status=404)

        serialized_cards = [
            {
                'id': card.id,
                'name': card.name,
                'artist': card.artist,
                'set_name': card.set_name,
                'set_num': card.set_num,
                'color': card.color,
                'image': card.image,
                'cost': card.cost,
                'inkable': card.inkable,
                'type': card.type,
                'rarity': card.rarity,
                'flavor_text': card.flavor_text,
                'card_num': card.card_num,
                'body_text': card.body_text,
                'set_id': card.set_id,
            }
            for card in current_page
        ]

        return JsonResponse({
            'data': serialized_cards,
            'total_pages': paginator.num_pages
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def fetch_mtg_cards(request):
    search_term = request.GET.get('search', '')
    page = request.GET.get('page', '1')

    try:
        cards_query = MTGCardsData.objects.filter(
            Q(name__icontains=search_term) |
            Q(type_line__icontains=search_term)
        ).order_by('id').prefetch_related('card_faces', 'all_parts')

        page_size = 20
        total_pages = (cards_query.count() + page_size - 1) // page_size
        cards_page = cards_query[int(page) * page_size - page_size:int(page) * page_size]

        cards_data = []
        for card in cards_page:
            card_data = {
                'id': card.id,
                'name': card.name,
                'lang': card.lang,
                'released_at': card.released_at,
                'uri': card.uri,
                'layout': card.layout,
                'image_uris': card.image_uris,
                'cmc': card.cmc,
                'type_line': card.type_line,
                'color_identity': card.color_identity,
                'keywords': card.keywords,
                'legalities': card.legalities,
                'games': card.games,
                'set': card.set,
                'set_name': card.set_name,
                'set_type': card.set_type,
                'rarity': card.rarity,
                'artist': card.artist,
                'prices': card.prices,
                'related_uris': card.related_uris,
            }

            card_faces = MTGCardFace.objects.filter(card=card)
            if card_faces.exists():
                card_data['card_faces'] = [{'name': face.name, 'mana_cost': face.mana_cost, 'type_line': face.type_line, 'oracle_text': face.oracle_text, 'colors': face.colors, 'power': face.power, 'toughness': face.toughness, 'artist': face.artist, 'image_uris': face.image_uris} for face in card_faces]

            related_cards = MTGRelatedCard.objects.filter(mtgcardsdata=card)
            if related_cards.exists():
                card_data['all_parts'] = [{'component': part.component, 'name': part.name, 'type_line': part.type_line, 'uri': part.uri} for part in related_cards]

            cards_data.append(card_data)

        return JsonResponse({'data': cards_data, 'total_pages': total_pages}, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)