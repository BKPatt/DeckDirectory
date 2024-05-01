from django.core.management.base import BaseCommand, CommandError
from backend.api.models import YugiohCard, CardSet, CardImage, CardPrice
import requests

class Command(BaseCommand):
    help = 'Updates the Yugioh cards in the database'

    def handle(self, *args, **options):
        try:
            url = 'https://db.ygoprodeck.com/api/v7/cardinfo.php'
            response = requests.get(url)
            response.raise_for_status()
            cards_data = response.json().get('data', [])

            for card_data in cards_data:
                yugioh_card, created = YugiohCard.objects.get_or_create(
                    id=card_data['id'],
                    defaults={
                        'name': card_data['name'],
                        'card_type': card_data.get('type', ''),
                        'frame_type': card_data.get('race', ''),
                        'description': card_data.get('desc', ''),
                        'attack': card_data.get('atk', 0),
                        'defense': card_data.get('def', 0),
                        'level': card_data.get('level', 0),
                        'race': card_data.get('race', ''),
                        'attribute': card_data.get('attribute', '')
                    }
                )

                if created:
                    for set_info in card_data.get('card_sets', []):
                        CardSet.objects.create(
                            yugioh_card=yugioh_card,
                            set_name=set_info['set_name'],
                            set_code=set_info['set_code'],
                            set_rarity=set_info['set_rarity'],
                            set_rarity_code=set_info['set_rarity_code'],
                            set_price=set_info['set_price']
                        )

                    for image_info in card_data.get('card_images', []):
                        CardImage.objects.create(
                            yugioh_card=yugioh_card,
                            image_url=image_info['image_url'],
                            image_url_small=image_info['image_url_small'],
                            image_url_cropped=image_info['image_url_cropped']
                        )

                    for price_info in card_data.get('card_prices', []):
                        CardPrice.objects.create(
                            yugioh_card=yugioh_card,
                            cardmarket_price=price_info.get('cardmarket_price', ''),
                            tcgplayer_price=price_info.get('tcgplayer_price', ''),
                            ebay_price=price_info.get('ebay_price', ''),
                            amazon_price=price_info.get('amazon_price', ''),
                            coolstuffinc_price=price_info.get('coolstuffinc_price', '')
                        )

            self.stdout.write(self.style.SUCCESS('Successfully updated Yugioh cards'))

        except requests.RequestException as e:
            raise CommandError(f'Error updating cards: {e}')