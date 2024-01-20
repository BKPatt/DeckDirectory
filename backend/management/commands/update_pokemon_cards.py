from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import PokemonCardData, PokemonAttack, PokemonWeakness, PokemonCardSet
import requests
import datetime
from django.utils import timezone
from pathlib import Path
from decouple import Config, RepositoryEnv

BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / '.env'
config = Config(RepositoryEnv(env_file))

# Helper function to convert date format
def convert_date_format(date_str, is_datetime=False):
    if date_str:
        try:
            if is_datetime:
                aware_datetime = timezone.make_aware(
                    datetime.datetime.strptime(date_str, '%Y/%m/%d %H:%M:%S'),
                    timezone.get_default_timezone()
                )
                return aware_datetime.strftime('%Y-%m-%d %H:%M:%S')
            else:
                return datetime.datetime.strptime(date_str, '%Y/%m/%d').strftime('%Y-%m-%d')
        except ValueError:
            return None
    return None

class Command(BaseCommand):
    help = 'Fetch and update Pokemon card data from the API'

    def handle(self, *args, **options):
        api_url = "https://api.pokemontcg.io/v2/cards"
        headers = {'X-Api-Key': config('REACT_APP_POKEMON_TCG_API_KEY')}
        page = 1
        cards_per_page = 250
        all_cards = []

        while True:
            params = {'page': page, 'pageSize': cards_per_page}
            response = requests.get(api_url, headers=headers, params=params)
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR('Failed to fetch data from the API'))
                break

            data = response.json()
            for card_data in data.get('data', []):
                with transaction.atomic():
                    # Create or update the main card data
                    card, created = PokemonCardData.objects.update_or_create(
                        id=card_data['id'],
                        defaults={
                            'name': card_data.get('name', ''),
                            'supertype': card_data.get('supertype', ''),
                            'subtypes': card_data.get('subtypes', []),
                            'level': card_data.get('level', ''),
                            'hp': card_data.get('hp', ''),
                            'types': card_data.get('types', []),
                            'retreatCost': card_data.get('retreatCost', []),
                            'convertedRetreatCost': card_data.get('convertedRetreatCost', 0),
                            'number': card_data.get('number', ''),
                            'artist': card_data.get('artist', ''),
                            'rarity': card_data.get('rarity', ''),
                            'flavorText': card_data.get('flavorText', ''),
                            'nationalPokedexNumbers': card_data.get('nationalPokedexNumbers', []),
                            'legalities': card_data.get('legalities', {}),
                            'images': card_data.get('images', {}),
                            'tcgplayer': card_data.get('tcgplayer', {}),
                            'cardmarket': card_data.get('cardmarket', {}),
                        }
                    )

                    # Handling attacks
                    for attack_data in card_data.get('attacks', []):
                        attack, _ = PokemonAttack.objects.get_or_create(
                            name=attack_data['name'],
                            defaults={
                                'cost': attack_data.get('cost', []),
                                'convertedEnergyCost': attack_data.get('convertedEnergyCost', 0),
                                'damage': attack_data.get('damage', ''),
                                'text': attack_data.get('text', '')
                            }
                        )
                        card.attacks.add(attack)

                    # Handling weaknesses
                    for weakness_data in card_data.get('weaknesses', []):
                        weakness, _ = PokemonWeakness.objects.get_or_create(
                            type=weakness_data['type'],
                            defaults={'value': weakness_data.get('value', '')}
                        )
                        card.weaknesses.add(weakness)

                    # Handling card set
                    set_data = card_data.get('set', {})
                    card_set = None
                    if set_data:
                        card_set, _ = PokemonCardSet.objects.get_or_create(
                            id=set_data['id'],
                            defaults={
                                'name': set_data.get('name', ''),
                                'series': set_data.get('series', ''),
                                'printedTotal': set_data.get('printedTotal', 0),
                                'total': set_data.get('total', 0),
                                'legalities': set_data.get('legalities', {}),
                                'ptcgoCode': set_data.get('ptcgoCode', ''),
                                'releaseDate': convert_date_format(set_data.get('releaseDate', '')),
                                'updatedAt': convert_date_format(set_data.get('updatedAt', ''), is_datetime=True),
                                'symbol': set_data.get('symbol', ''),
                                'logo': set_data.get('logo', ''),
                            }
                        )
                        card.set = card_set

                    all_cards.append(card)
                    card.save()

            if page >= 75:
                break
            page += 1

        self.stdout.write(self.style.SUCCESS('Successfully updated Pokemon cards'))