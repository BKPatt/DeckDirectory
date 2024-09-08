from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import PokemonCardData
from django.core.paginator import Paginator, EmptyPage
from django.http import JsonResponse
from django.db.models import FloatField, Value, ExpressionWrapper, F, Func, Count
from django.db.models.functions import Coalesce

# Custom Django ORM function to extract a numeric value from JSONB data
class JsonbExtractPathCast(Func):
    function = 'JSONB_EXTRACT_PATH_TEXT'
    template = "(CAST(JSONB_EXTRACT_PATH_TEXT(%(expressions)s) AS NUMERIC))"
    output_field = FloatField()

@api_view(['GET'])
def get_pokemon_cards_by_list(request, list_id):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        search_term = request.GET.get('search', '')
        supertype_filter = request.GET.get('supertype', '').strip()
        subtype_filter = [s.strip() for s in request.GET.getlist('subtype') if s.strip()]
        type_filter = [t.strip() for t in request.GET.getlist('type') if t.strip()]
        rarity_filter = request.GET.get('rarity', '').strip()
        set_filter = request.GET.get('set', '').strip()
        sort_by = request.GET.get('sort', None)

        # Query for fetching cards with combined price from tcgplayer and cardmarket
        cards_query = PokemonCardData.objects.filter(listcard__card_list_id=list_id).annotate(
            tcgplayer_market=Coalesce(
                JsonbExtractPathCast('tcgplayer__prices', Value('holofoil'), Value('market')),
                JsonbExtractPathCast('tcgplayer__prices', Value('normal'), Value('market')),
                Value(0.0),
                output_field=FloatField()
            ),
            cardmarket_market=Coalesce(
                JsonbExtractPathCast('cardmarket__prices', Value('reverseHoloTrend')),
                JsonbExtractPathCast('cardmarket__prices', Value('trendPrice')),
                Value(0.0),
                output_field=FloatField()
            )
        ).annotate(
            combined_average_price=ExpressionWrapper(
                F('tcgplayer_market') + F('cardmarket_market'),
                output_field=FloatField()
            ),
            card_count=Count('id')
        )

        # Filter based on query parameters
        if search_term:
            cards_query = cards_query.filter(name__icontains=search_term)
        if supertype_filter:
            cards_query = cards_query.filter(supertype=supertype_filter)
        if subtype_filter:
            cards_query = cards_query.filter(subtypes__in=subtype_filter)
        if type_filter:
            cards_query = cards_query.filter(types__in=type_filter)
        if rarity_filter:
            cards_query = cards_query.filter(rarity=rarity_filter)
        if set_filter:
            cards_query = cards_query.filter(set__name=set_filter)

        # Sorting logic
        if sort_by:
            if sort_by == 'name_asc':
                cards_query = cards_query.order_by('name')
            elif sort_by == 'name_desc':
                cards_query = cards_query.order_by('-name')
            elif sort_by == 'price_asc':
                cards_query = cards_query.order_by('combined_average_price')
            elif sort_by == 'price_desc':
                cards_query = cards_query.order_by('-combined_average_price')
        else:
            cards_query = cards_query.order_by('set__releaseDate')

        paginator = Paginator(cards_query, page_size)
        try:
            current_page = paginator.page(page)
        except EmptyPage:
            return Response({'error': 'Page not found'}, status=404)

        # Serialize card data for response
        serialized_data = []
        for card in current_page:
            try:
                card_data = {
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
                    'rarity': card.rarity,
                    'flavorText': card.flavorText,
                    'nationalPokedexNumbers': card.nationalPokedexNumbers,
                    'legalities': card.legalities,
                    'images': card.images,
                    'count': card.card_count,
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
                serialized_data.append(card_data)
            except Exception as e:
                print(f"Error serializing card with ID {card['id']}: {e}")

        return JsonResponse({
            'data': serialized_data,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'page_size': page_size
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_filter_options(request):
    try:
        types = PokemonCardData.objects.values(type=F('types')).distinct()
        subtypes = PokemonCardData.objects.values('subtypes').distinct()
        supertypes = PokemonCardData.objects.values('supertype').distinct()
        rarities = PokemonCardData.objects.values('rarity').distinct()
        sets = PokemonCardData.objects.values('set__name').distinct()

        filter_options = {
            'types': [item['type'] for item in types],
            'subtypes': [item['subtypes'] for item in subtypes],
            'supertypes': [item['supertype'] for item in supertypes],
            'rarities': [item['rarity'] for item in rarities],
            'sets': [item['set__name'] for item in sets],
        }

        return Response(filter_options)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

def pokemon_cards_api(request):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        search_term = request.GET.get('search', '')
        isInAddMode = request.GET.get('isInAddMode', False)
        list_id = request.GET.get('list_id', None)
        sort_by = request.GET.get('sort', None)

        supertype_filter = request.GET.get('supertype', '').strip()
        subtype_filter = [s.strip() for s in request.GET.getlist('subtype') if s.strip()]
        type_filter = [t.strip() for t in request.GET.getlist('type') if t.strip()]
        rarity_filter = request.GET.get('rarity', '').strip()
        set_filter = request.GET.get('set', '').strip()

        cards_query = PokemonCardData.objects.annotate(
            tcgplayer_market=Coalesce(
                JsonbExtractPathCast('tcgplayer__prices', Value('holofoil'), Value('market')),
                JsonbExtractPathCast('tcgplayer__prices', Value('normal'), Value('market')),
                Value(0.0),
                output_field=FloatField()
            ),
            cardmarket_market=Coalesce(
                JsonbExtractPathCast('cardmarket__prices', Value('reverseHoloTrend')),
                JsonbExtractPathCast('cardmarket__prices', Value('trendPrice')),
                Value(0.0),
                output_field=FloatField()
            )
        ).annotate(
            combined_average_price=ExpressionWrapper(
                F('tcgplayer_market') + F('cardmarket_market'),
                output_field=FloatField()
            )
        )

        if list_id and not isInAddMode:
            cards_query = cards_query.filter(listcard__card_list_id=list_id)

        if search_term:
            cards_query = cards_query.filter(name__icontains=search_term)
        if supertype_filter:
            cards_query = cards_query.filter(supertype=supertype_filter)
        if subtype_filter:
            cards_query = cards_query.filter(subtypes__in=subtype_filter)
        if type_filter:
            cards_query = cards_query.filter(types__in=type_filter)
        if rarity_filter:
            cards_query = cards_query.filter(rarity=rarity_filter)
        if set_filter:
            cards_query = cards_query.filter(set__name=set_filter)

        if sort_by:
            if sort_by == 'name_asc':
                cards_query = cards_query.order_by('name')
            elif sort_by == 'name_desc':
                cards_query = cards_query.order_by('-name')
            elif sort_by == 'price_asc':
                cards_query = cards_query.order_by('combined_average_price')
            elif sort_by == 'price_desc':
                cards_query = cards_query.order_by('-combined_average_price')

        paginator = Paginator(cards_query, page_size)
        try:
            current_page = paginator.page(page)
        except EmptyPage:
            return JsonResponse({'error': 'Page not found'}, status=404)

        # Serialize data for the current page
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
        print(f"Error in pokemon_cards_api: {e}")
        return JsonResponse({'error': str(e)}, status=500)
