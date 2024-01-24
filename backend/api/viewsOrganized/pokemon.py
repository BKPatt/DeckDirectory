from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import PokemonCardData, ListCard
from django.core.paginator import Paginator, EmptyPage
from django.http import JsonResponse
    
@api_view(['GET'])
def get_pokemon_cards_by_list(request, list_id):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        search_term = request.GET.get('search', '')

        list_cards = ListCard.objects.filter(card_list_id=list_id, pokemon_card__isnull=False).select_related('pokemon_card')
        pokemon_cards = [lc.pokemon_card for lc in list_cards]

        if search_term:
            pokemon_cards = [card for card in pokemon_cards if search_term.lower() in card.name.lower()]

        paginator = Paginator(pokemon_cards, page_size)
        try:
            current_page = paginator.page(page)
        except EmptyPage:
            return Response({'error': 'Page not found'}, status=404)
        
        serialized_data = []
        for card in pokemon_cards:
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

        return JsonResponse({
            'data': serialized_data,
            'total_pages': paginator.num_pages
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
def pokemon_cards_api(request):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        search_term = request.GET.get('search', '')
        list_id = request.GET.get('list_id', None)
        cards_query = PokemonCardData.objects.all()

        if list_id:
            cards_query = cards_query.filter(listcard__card_list_id=list_id)

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