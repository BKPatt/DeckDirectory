from rest_framework.decorators import api_view
from ..models import LorcanaCardData, ListCard
from django.core.paginator import Paginator, EmptyPage
from rest_framework.response import Response
from django.http import JsonResponse

@api_view(['GET'])
def get_lorcana_cards_by_list(request, list_id):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    search_term = request.GET.get('search', '')

    list_cards = ListCard.objects.filter(card_list_id=list_id, lorcana_card__isnull=False).select_related('lorcana_card')
    lorcana_cards = [lc.lorcana_card for lc in list_cards]

    if search_term:
        lorcana_cards = [card for card in lorcana_cards if search_term.lower() in card.name.lower()]

    paginator = Paginator(lorcana_cards, page_size)
    try:
        current_page = paginator.page(page)
    except EmptyPage:
        return Response({'error': 'Page not found'}, status=404)

    serialized_data = []
    for card in current_page:
        card_data = {
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
        serialized_data.append(card_data)

    return JsonResponse({
        'data': serialized_data,
        'total_pages': paginator.num_pages
    })
    
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