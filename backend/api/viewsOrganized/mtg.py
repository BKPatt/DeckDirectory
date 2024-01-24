from rest_framework.decorators import api_view
from ..models import MTGCardFace, MTGCardsData, MTGRelatedCard, ListCard
from django.core.paginator import Paginator, EmptyPage
from rest_framework.response import Response
from django.http import JsonResponse
from django.db.models import Q

@api_view(['GET'])
def get_mtg_cards_by_list(request, list_id):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    search_term = request.GET.get('search', '')

    list_cards = ListCard.objects.filter(card_list_id=list_id, mtg_card__isnull=False).select_related('mtg_card')
    mtg_cards = [lc.mtg_card for lc in list_cards]

    if search_term:
        mtg_cards = [card for card in mtg_cards if search_term.lower() in card.name.lower()]

    paginator = Paginator(mtg_cards, page_size)
    try:
        current_page = paginator.page(page)
    except EmptyPage:
        return Response({'error': 'Page not found'}, status=404)

    serialized_data = []
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
        serialized_data.append(card_data)

    return JsonResponse({
        'data': serialized_data,
        'total_pages': paginator.num_pages
    })

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