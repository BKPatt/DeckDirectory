from ..models import CardSet, YugiohCard, ListCard
from django.core.paginator import Paginator, EmptyPage
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q, Count

@api_view(['GET'])
def fetch_yugioh_cards(request):
    try:
        search_term = request.GET.get('search', '')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        type_filter = request.GET.get('card_type', None)
        frame_type_filter = request.GET.get('frame_type', None)
        race_filter = request.GET.get('race', None)
        attribute_filter = request.GET.get('attribute', None)
        set_name_filter = request.GET.get('set_name', None)
        rarity_filter = request.GET.get('rarity', None)
        sort_option = request.GET.get('sort', None)

        query = Q(name__icontains=search_term)
        if type_filter:
            query &= Q(card_type=type_filter)
        if frame_type_filter:
            query &= Q(frame_type=frame_type_filter)
        if race_filter:
            query &= Q(race=race_filter)
        if attribute_filter:
            query &= Q(attribute=attribute_filter)
        if set_name_filter:
            query &= Q(card_sets__set_name=set_name_filter)
        if rarity_filter:
            query &= Q(card_sets__set_rarity=rarity_filter)

        sort_options = {
            'name_asc': 'name',
            'name_desc': '-name',
            'price_asc': 'card_prices__cardmarket_price',
            'price_desc': '-card_prices__cardmarket_price',
        }

        sort_by = sort_options.get(sort_option, 'name')

        # Handle sorting by multiple price fields
        if sort_option and 'price' in sort_option:
            additional_price_fields = ['card_prices__ebay_price', 'card_prices__amazon_price']
            if sort_option.startswith('price_desc'):
                additional_price_fields = ['-' + field for field in additional_price_fields]
            sort_by = [sort_by] + additional_price_fields
        else:
            sort_by = [sort_by]

        cards = YugiohCard.objects.filter(query).order_by(*sort_by).prefetch_related('card_sets', 'card_images', 'card_prices')

        paginator = Paginator(cards, page_size)
        try:
            current_page = paginator.page(page)
        except EmptyPage:
            return Response({'error': 'Page not found'}, status=404)

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

        return JsonResponse({
            'data': card_list,
            'total_pages': paginator.num_pages
        })

    except Exception as e:
        print(f"Error: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['GET'])
def get_yugioh_cards_by_list(request, list_id):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        search_term = request.GET.get('search', '')
        type_filter = request.GET.get('card_type', None)
        frame_type_filter = request.GET.get('frame_type', None)
        race_filter = request.GET.get('race', None)
        attribute_filter = request.GET.get('attribute', None)
        set_name_filter = request.GET.get('set_name', None)
        rarity_filter = request.GET.get('rarity', None)
        sort_option = request.GET.get('sort', 'name')

        list_cards_query = ListCard.objects.filter(
            card_list_id=list_id, 
            yugioh_card__isnull=False
        )

        query = Q(yugioh_card__name__icontains=search_term)
        if type_filter:
            query &= Q(yugioh_card__card_type=type_filter)
        if frame_type_filter:
            query &= Q(yugioh_card__frame_type=frame_type_filter)
        if race_filter:
            query &= Q(yugioh_card__race=race_filter)
        if attribute_filter:
            query &= Q(yugioh_card__attribute=attribute_filter)
        if set_name_filter:
            query &= Q(yugioh_card__card_sets__set_name=set_name_filter)
        if rarity_filter:
            query &= Q(yugioh_card__card_sets__set_rarity=rarity_filter)

        list_cards_query = list_cards_query.filter(query).values(
            'yugioh_card_id'
        ).annotate(
            card_count=Count('id')
        )

        sort_options = {
            'name_asc': 'yugioh_card__name',
            'name_desc': '-yugioh_card__name',
            'price_asc': 'yugioh_card__card_prices__cardmarket_price',
            'price_desc': '-yugioh_card__card_prices__cardmarket_price',
        }

        sort_by = sort_options.get(sort_option, 'yugioh_card__name')
        sort_criteria = [sort_by]

        if 'price' in sort_option:
            additional_price_fields = ['yugioh_card__card_prices__ebay_price', 'yugioh_card__card_prices__amazon_price']
            if sort_option.startswith('price_desc'):
                additional_price_fields = ['-' + field for field in additional_price_fields]
            sort_criteria.extend(additional_price_fields)

        list_cards_query = list_cards_query.order_by(*sort_criteria)

        paginator = Paginator(list_cards_query, page_size)
        try:
            current_page = paginator.page(page)
        except EmptyPage:
            return Response({'error': 'Page not found'}, status=404)

        serialized_data = []
        for list_card in current_page:
            card_id = list_card['yugioh_card_id']
            card = YugiohCard.objects.get(pk=card_id)
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
                'card_count': list_card['card_count']
            }
            serialized_data.append(card_data)

        return JsonResponse({
            'data': serialized_data,
            'total_pages': paginator.num_pages
        })
    except Exception as e:
        print(f"Error: {e}")
        return Response({'error': str(e)}, status=500)
    
@api_view(['GET'])
def get_yugioh_filter_options(request):
    try:
        card_type = YugiohCard.objects.values('card_type').distinct()
        frame_type = YugiohCard.objects.values('frame_type').distinct()
        race = YugiohCard.objects.values('race').distinct()
        attribute = YugiohCard.objects.values('attribute').distinct()
        set_name = CardSet.objects.values('set_name').distinct().order_by('set_name')
        rarities = CardSet.objects.values('set_rarity').distinct()

        filter_options = {
            'card_type': [item['card_type'] for item in card_type],
            'frame_type': [item['frame_type'] for item in frame_type],
            'race': [item['race'] for item in race],
            'attribute': [item['attribute'] for item in attribute],
            'rarities': [item['set_rarity'] for item in rarities],
            'set_name': [item['set_name'] for item in set_name],
        }

        return Response(filter_options)
    except Exception as e:
        print(f"Error: {e}")
        return Response({'error': str(e)}, status=500)
