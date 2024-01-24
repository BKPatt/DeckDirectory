from ..models import YugiohCard, ListCard
from django.core.paginator import Paginator, EmptyPage
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

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
    
@api_view(['GET'])
def get_yugioh_cards_by_list(request, list_id):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    search_term = request.GET.get('search', '')

    list_cards = ListCard.objects.filter(card_list_id=list_id, yugioh_card__isnull=False).select_related('yugioh_card')
    yugioh_cards = [lc.yugioh_card for lc in list_cards]

    if search_term:
        yugioh_cards = [card for card in yugioh_cards if search_term.lower() in card.name.lower()]

    paginator = Paginator(yugioh_cards, page_size)
    try:
        current_page = paginator.page(page)
    except EmptyPage:
        return Response({'error': 'Page not found'}, status=404)

    serialized_data = []
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
        serialized_data.append(card_data)

    return JsonResponse({
        'data': serialized_data,
        'total_pages': paginator.num_pages
    })
    