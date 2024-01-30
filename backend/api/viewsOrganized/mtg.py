from rest_framework.decorators import api_view
from ..models import MTGCardsData, ListCard
from django.core.paginator import Paginator, EmptyPage
from rest_framework.response import Response
from django.http import JsonResponse
from django.db.models import Q, Count

@api_view(['GET'])
def get_mtg_cards_by_list(request, list_id):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    search_term = request.GET.get('search', '')
    type_filter = request.GET.get('type_line', None)
    rarity_filter = request.GET.get('rarity', None)
    set_filter = request.GET.get('set', None)
    sort_option = request.GET.get('sort', None)

    list_cards_query = ListCard.objects.filter(card_list_id=list_id, mtg_card__isnull=False).values('mtg_card').annotate(card_count=Count('id'))

    query = Q(mtg_card__name__icontains=search_term)
    if type_filter:
        query &= Q(mtg_card__type_line__icontains=type_filter)
    if rarity_filter:
        query &= Q(mtg_card__rarity=rarity_filter)
    if set_filter:
        query &= Q(mtg_card__set_name__icontains=set_filter)
    list_cards_query = list_cards_query.filter(query)

    sort_by = '-card_count'
    if sort_option == 'name_asc':
        sort_by = 'mtg_card__name'
    elif sort_option == 'name_desc':
        sort_by = '-mtg_card__name'
    elif sort_option == 'price_asc':
        sort_by = 'mtg_card__prices'
    elif sort_option == 'price_desc':
        sort_by = '-mtg_card__prices'

    list_cards_query = list_cards_query.order_by(sort_by)

    paginator = Paginator(list_cards_query, page_size)
    try:
        current_page = paginator.page(page)
    except EmptyPage:
        return Response({'error': 'Page not found'}, status=404)

    serialized_data = []
    for list_card in current_page:
        card_id = list_card['mtg_card']
        card = MTGCardsData.objects.get(pk=card_id)
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
            'card_faces': [{'name': face.name, 'mana_cost': face.mana_cost, 'type_line': face.type_line, 'oracle_text': face.oracle_text, 'colors': face.colors, 'power': face.power, 'toughness': face.toughness, 'artist': face.artist, 'image_uris': face.image_uris} for face in card.card_faces.all()],
            'all_parts': [{'component': part.component, 'name': part.name, 'type_line': part.type_line, 'uri': part.uri} for part in card.all_parts.all()],
            'card_count': list_card['card_count']
        }
        serialized_data.append(card_data)

    return JsonResponse({
        'data': serialized_data,
        'total_pages': paginator.num_pages
    })

@api_view(['GET'])
def get_mtg_filter_options(request):
    try:
        type_lines = MTGCardsData.objects.values_list('type_line', flat=True).distinct()
        rarities = MTGCardsData.objects.values('rarity').distinct()
        sets = MTGCardsData.objects.values('set_name').distinct()

        processed_type_lines = set(item.split(' — ')[0] for item in type_lines if item)

        filter_options = {
            'type_line': sorted(list(processed_type_lines)),
            'rarities': [item['rarity'] for item in rarities],
            'sets': [item['set_name'] for item in sets],
        }

        return Response(filter_options)
    except Exception as e:
        print(f"Error: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def fetch_mtg_cards(request):
    search_term = request.GET.get('search', '')
    page = int(request.GET.get('page', 1))
    type_filter = request.GET.get('type_line', None)
    rarity_filter = request.GET.get('rarity', None)
    set_filter = request.GET.get('set', None)
    sort_option = request.GET.get('sort', None)

    query = Q(name__icontains=search_term) | Q(type_line__icontains=search_term)
    if type_filter:
        query &= Q(type_line__icontains=type_filter)
    if rarity_filter:
        query &= Q(rarity=rarity_filter)
    if set_filter:
        query &= Q(set_name__icontains=set_filter)

    sort_by = 'name'
    if sort_option == 'name_desc':
        sort_by = '-name'
    elif sort_option == 'price_asc':
        sort_by = 'prices'
    elif sort_option == 'price_desc':
        sort_by = '-prices'

    try:
        cards_query = MTGCardsData.objects.filter(query).order_by(sort_by).prefetch_related('card_faces', 'all_parts')
        paginator = Paginator(cards_query, 20)

        try:
            current_page = paginator.page(page)
        except EmptyPage:
            return Response({'error': 'Page not found'}, status=404)

        cards_data = []
        for card in current_page:
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
                'card_faces': [{'name': face.name, 'mana_cost': face.mana_cost, 'type_line': face.type_line, 'oracle_text': face.oracle_text, 'colors': face.colors, 'power': face.power, 'toughness': face.toughness, 'artist': face.artist, 'image_uris': face.image_uris} for face in card.card_faces.all()],
                'all_parts': [{'component': part.component, 'name': part.name, 'type_line': part.type_line, 'uri': part.uri} for part in card.all_parts.all()],
            }
            cards_data.append(card_data)

        return JsonResponse({'data': cards_data, 'total_pages': paginator.num_pages}, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
