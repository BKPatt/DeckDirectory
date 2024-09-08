from celery import shared_task
from .models import CardList, ListCard
from decimal import Decimal, InvalidOperation

def calculate_average_price(prices):
    if not prices:
        return Decimal('0.00')

    # Sort prices and calculate Q1, Q3, and IQR to filter outliers
    prices = sorted(Decimal(str(price)) for price in prices if price)
    mid_index = len(prices) // 2
    Q1 = prices[mid_index // 2] if len(prices) % 2 else (prices[mid_index // 2 - 1] + prices[mid_index // 2]) / 2
    Q3 = prices[-(mid_index // 2) - 1] if len(prices) % 2 else (prices[-(mid_index // 2) - 1] + prices[-(mid_index // 2)]) / 2
    IQR = Q3 - Q1

    # Filter prices based on IQR range
    lower_bound = Q1 - (Decimal('1.5') * IQR)
    upper_bound = Q3 + (Decimal('1.5') * IQR)
    filtered_prices = [price for price in prices if lower_bound <= price <= upper_bound]

    try:
        average = sum(filtered_prices) / Decimal(len(filtered_prices))
    except (InvalidOperation, ZeroDivisionError, TypeError):
        average = Decimal('0.00')

    return average

def get_card_market_price(card, card_type):
    """
    Calculate the market price of a card based on its type.
    """
    if card_type == 'pokemon':
        price_values = []
        if card.tcgplayer and card.tcgplayer.prices:
            price_values.append(card.tcgplayer.prices.get('trendPrice', 0))
            price_values.append(card.tcgplayer.prices.get('reverseHoloTrend', 0))
        if card.cardmarket and card.cardmarket.prices:
            price_values.append(card.cardmarket.prices.get('averageSellPrice', 0))
        return calculate_average_price([Decimal(str(price)) for price in price_values])

    elif card_type == 'yugioh':
        price_values = []
        prices = card.card_prices.all()
        for price in prices:
            if price.cardmarket_price:
                price_values.append(Decimal(price.cardmarket_price))
            if price.ebay_price:
                price_values.append(Decimal(price.ebay_price))
            if price.amazon_price:
                price_values.append(Decimal(price.amazon_price))
            if price.tcgplayer_price:
                price_values.append(Decimal(price.tcgplayer_price))
            if price.coolstuffinc_price:
                price_values.append(Decimal(price.coolstuffinc_price))
        return calculate_average_price(price_values)

    elif card_type == 'mtg':
        return Decimal(card.prices.get('usd', 0)) if card.prices and 'usd' in card.prices else Decimal('0.00')

    elif card_type == 'lorcana':
        return Decimal(card.cost) if card.cost else Decimal('0.00')

    return Decimal('0.00')

def get_card_type_and_instance(list_card):
    """
    Determine the card's type and retrieve its instance from a ListCard object.
    """
    if list_card.pokemon_card:
        return 'pokemon', list_card.pokemon_card
    elif list_card.yugioh_card:
        return 'yugioh', list_card.yugioh_card
    elif list_card.mtg_card:
        return 'mtg', list_card.mtg_card
    elif list_card.lorcana_card:
        return 'lorcana', list_card.lorcana_card
    else:
        return None, None

@shared_task
def bulk_update_market_values():
    try:
        card_lists = CardList.objects.filter(needs_update=True)
        for card_list in card_lists:
            new_market_value = Decimal('0.00')
            list_cards = ListCard.objects.filter(card_list=card_list)
            
            for list_card in list_cards:
                card_type, card_instance = get_card_type_and_instance(list_card)
                if card_instance:
                    card_price = get_card_market_price(card_instance, card_type)
                    new_market_value += card_price
            print(new_market_value)
            card_list.market_value = new_market_value
            card_list.needs_update = False
            card_list.save()
    except Exception as e:
        print(e)

@shared_task
def bulk_update_collection_values():
    card_lists = CardList.objects.filter(needs_update=True)
    for card_list in card_lists:
        new_collection_value = Decimal('0.00')
        collected_cards = ListCard.objects.filter(card_list=card_list, collected=True)
        
        for list_card in collected_cards:
            card_type, card_instance = get_card_type_and_instance(list_card)
            if card_instance:
                card_price = get_card_market_price(card_instance, card_type)
                new_collection_value += card_price
        
        card_list.collection_value = new_collection_value
        card_list.needs_update = False
        card_list.save()
