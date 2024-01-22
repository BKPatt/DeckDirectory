from django.core.management.base import BaseCommand, CommandError
import requests
from backend.api.models import LorcanaCardData

class Command(BaseCommand):
    help = 'Fetches and updates Lorcana cards in the database'

    def handle(self, *args, **options):
        try:
            url = 'https://api.lorcana-api.com/cards/fetch'
            response = requests.get(url)
            response.raise_for_status()
            cards_data = response.json()
            print(card_data)

            for card_data in cards_data:
                lorcana_card, created = LorcanaCardData.objects.get_or_create(
                    name=card_data['Name'],
                    defaults={
                        'artist': card_data['Artist'],
                        'set_name': card_data['Set_Name'],
                        'set_num': card_data['Set_Num'],
                        'color': card_data['Color'],
                        'image': card_data['Image'],
                        'cost': card_data['Cost'],
                        'inkable': card_data['Inkable'],
                        'type': card_data['Type'],
                        'rarity': card_data['Rarity'],
                        'flavor_text': card_data.get('Flavor_Text', ''),
                        'card_num': card_data['Card_Num'],
                        'body_text': card_data.get('Body_Text', ''),
                        'set_id': card_data['Set_ID']
                    }
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f'Added new card: {lorcana_card.name}'))
                else:
                    self.stdout.write(f'Card already exists: {lorcana_card.name}')

        except requests.RequestException as e:
            raise CommandError(f'Error fetching Lorcana cards: {e}')
