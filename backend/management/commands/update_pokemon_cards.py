from django.utils import timezone
import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import (
    PokemonCardData, PokemonAttack, PokemonWeakness, PokemonCardSet,
    PokemonAbility, PokemonTcgplayer, PokemonCardmarket
)
import requests
from pathlib import Path
from decouple import Config, RepositoryEnv

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
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
                # Assuming date-only fields are not required to be timezone-aware
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

        while True:
            params = {'page': page, 'pageSize': cards_per_page}
            response = requests.get(api_url, headers=headers, params=params)
            if response.status_code != 200:
                self.stdout.write(self.style.ERROR('Failed to fetch data from the API'))
                break

            data = response.json()
            for card_data in data.get('data', []):
                with transaction.atomic():
                    card_set_data = card_data.get('set', {})
                    card_set, _ = PokemonCardSet.objects.update_or_create(
                        id=card_set_data.get('id', ''),
                        defaults={
                            'name': card_set_data.get('name', ''),
                            'series': card_set_data.get('series', ''),
                            'printedTotal': card_set_data.get('printedTotal', 0),
                            'total': card_set_data.get('total', 0),
                            'legalities': card_set_data.get('legalities', {}),
                            'ptcgoCode': card_set_data.get('ptcgoCode', ''),
                            'releaseDate': convert_date_format(card_set_data.get('releaseDate', '')),
                            'updatedAt': convert_date_format(card_set_data.get('updatedAt', ''), is_datetime=True),
                            'images': card_set_data.get('images', {})
                        }
                    )

                    tcgplayer_data = card_data.get('tcgplayer', {})
                    if tcgplayer_data:
                        tcgplayer, _ = PokemonTcgplayer.objects.update_or_create(
                            url=tcgplayer_data.get('url', ''),
                            defaults={
                                'updatedAt': convert_date_format(tcgplayer_data.get('updatedAt', None), is_datetime=True),
                                'prices': tcgplayer_data.get('prices', {})
                            }
                        )
                    else:
                        tcgplayer = None

                    cardmarket_data = card_data.get('cardmarket', {})
                    if cardmarket_data:
                        cardmarket, _ = PokemonCardmarket.objects.update_or_create(
                            url=cardmarket_data.get('url', ''),
                            defaults={
                                'updatedAt': convert_date_format(tcgplayer_data.get('updatedAt', None), is_datetime=True),
                                'prices': cardmarket_data.get('prices', {})
                            }
                        )
                    else:
                        cardmarket = None

                    card, created = PokemonCardData.objects.update_or_create(
                        id=card_data['id'],
                        defaults={
                            'name': card_data.get('name', ''),
                            'supertype': card_data.get('supertype', ''),
                            'subtypes': card_data.get('subtypes', []),
                            'level': card_data.get('level', ''),
                            'hp': card_data.get('hp', ''),
                            'types': card_data.get('types', []),
                            'evolvesFrom': card_data.get('evolvesFrom', ''),
                            'retreatCost': card_data.get('retreatCost', []),
                            'convertedRetreatCost': card_data.get('convertedRetreatCost', 0),
                            'number': card_data.get('number', ''),
                            'artist': card_data.get('artist', ''),
                            'rarity': card_data.get('rarity', ''),
                            'flavorText': card_data.get('flavorText', ''),
                            'nationalPokedexNumbers': card_data.get('nationalPokedexNumbers', []),
                            'legalities': card_data.get('legalities', {}),
                            'images': card_data.get('images', {}),
                            'set': card_set,
                            'rules': card_data.get('rules', []),
                            'tcgplayer': tcgplayer,
                            'cardmarket': cardmarket,
                        }
                    )

                    abilities_data = card_data.get('abilities', [])
                    for ability_data in abilities_data:
                        ability, _ = PokemonAbility.objects.get_or_create(
                            name=ability_data['name'],
                            defaults={
                                'text': ability_data.get('text', ''),
                                'type': ability_data.get('type', '')
                            }
                        )
                        card.abilities.add(ability)

                    attacks_data = card_data.get('attacks', [])
                    for attack_data in attacks_data:
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

                    weaknesses_data = card_data.get('weaknesses', [])
                    for weakness_data in weaknesses_data:
                        weakness, _ = PokemonWeakness.objects.get_or_create(
                            type=weakness_data['type'],
                            defaults={'value': weakness_data.get('value', '')}
                        )
                        card.weaknesses.add(weakness)

                    card.save()

            if page >= 100:
                break
            page += 1

        self.stdout.write(self.style.SUCCESS('Successfully updated Pokemon cards'))
