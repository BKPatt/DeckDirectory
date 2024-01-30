from rest_framework.decorators import api_view
from ..models import LorcanaCardData, ListCard
from django.core.paginator import Paginator, EmptyPage
from rest_framework.response import Response
from django.http import JsonResponse
from django.db.models import Q, Count
from django.db.models.functions import Lower

@api_view(['GET'])
def get_lorcana_cards_by_list(request, list_id):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    search_term = request.GET.get('search', '')
    color = request.GET.get('color', None)
    rarity = request.GET.get('rarity', None)
    set_name = request.GET.get('set_name', None)
    sort_option = request.GET.get('sort', None)

    query = Q()
    if search_term:
        query &= Q(lorcana_card__name__icontains=search_term)
    if color:
        query &= Q(lorcana_card__color__icontains=color)
    if rarity:
        query &= Q(lorcana_card__rarity=rarity)
    if set_name:
        query &= Q(lorcana_card__set_name__icontains=set_name)

    list_cards_query = ListCard.objects.filter(card_list_id=list_id, lorcana_card__isnull=False).filter(query).values('lorcana_card').annotate(card_count=Count('id'))

    sort_options = {
        'name_asc': 'lorcana_card__name',
        'name_desc': '-lorcana_card__name',
        'price_asc': 'lorcana_card__cost',
        'price_desc': '-lorcana_card__cost',
    }
    sort_by = sort_options.get(sort_option, 'lorcana_card__name')

    list_cards_query = list_cards_query.order_by(sort_by)

    paginator = Paginator(list_cards_query, page_size)
    try:
        current_page = paginator.page(page)
    except EmptyPage:
        return Response({'error': 'Page not found'}, status=404)

    serialized_data = []
    for list_card in current_page:
        card = LorcanaCardData.objects.get(pk=list_card['lorcana_card'])
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
            'card_count': list_card['card_count']
        }
        serialized_data.append(card_data)

    return JsonResponse({
        'data': serialized_data,
        'total_pages': paginator.num_pages
    })
    
@api_view(['GET'])
def fetch_lorcana_cards(request):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        search_term = request.GET.get('search', '')
        color = request.GET.get('color', None)
        rarity = request.GET.get('rarity', None)
        set_name = request.GET.get('set_name', None)
        sort_option = request.GET.get('sort', None)

        query = Q()
        if search_term:
            query &= Q(name__icontains=search_term)
        if color:
            query &= Q(color__icontains=color)
        if rarity:
            query &= Q(rarity=rarity)
        if set_name:
            query &= Q(set_name__icontains=set_name)

        if sort_option == 'name_desc':
            sort_by = '-name'
        elif sort_option == 'price_asc':
            sort_by = 'cost'
        elif sort_option == 'price_desc':
            sort_by = '-cost'
        else:
            sort_by = 'name'

        cards_query = LorcanaCardData.objects.filter(query).order_by(sort_by)

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
        print(f"Error: {e}")
        return JsonResponse({'error': str(e)}, status=500)

    
@api_view(['GET'])
def get_mtg_filter_options(request):
    try:
        spelling_corrections = {
            'rise of ther floodborn': 'Rise of the Floodborn',
        }

        color = LorcanaCardData.objects.values('color').distinct()
        rarity = LorcanaCardData.objects.values('rarity').distinct()
        set_name = LorcanaCardData.objects.annotate(
            set_name_lower=Lower('set_name')
        ).values_list('set_name_lower', flat=True).distinct()

        corrected_set_names = set()
        for name in set_name:
            corrected_name = spelling_corrections.get(name.lower(), name)
            corrected_set_names.add(corrected_name.title())

        unique_set_names = list(set([name.capitalize() for name in corrected_set_names]))

        filter_options = {
            'color': [item['color'] for item in color],
            'rarity': [item['rarity'] for item in rarity],
            'set_name': sorted(unique_set_names),
        }

        return Response(filter_options)
    except Exception as e:
        print(f"Error: {e}")
        return Response({'error': str(e)}, status=500)