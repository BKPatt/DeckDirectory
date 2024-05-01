from django.core.management.base import BaseCommand
import requests
from django.db import transaction
from django.http import JsonResponse
from backend.api.models import MTGCardFace, MTGCardsData, MTGRelatedCard

class Command(BaseCommand):
    help = 'Updates the Yugioh cards in the database'

    def handle(self, *args, **options):
        base_url = 'https://api.scryfall.com/cards/search'
        page = 1

        try:
            while True:
                url = f'{base_url}?q=&page={page}'
                response = requests.get(url)
                response.raise_for_status()
                data = response.json()

                with transaction.atomic():
                    for card_data in data.get('data', []):
                        defaults = {
                            'oracle_id': card_data.get('oracle_id'),
                            'name': card_data['name'],
                            'lang': card_data.get('lang', 'en'),
                            'released_at': card_data.get('released_at'),
                            'uri': card_data['uri'],
                            'layout': card_data.get('layout'),
                            'image_uris': card_data.get('image_uris', {}),
                            'cmc': card_data.get('cmc', 0),
                            'type_line': card_data.get('type_line'),
                            'color_identity': card_data.get('color_identity', []),
                            'keywords': card_data.get('keywords', []),
                            'legalities': card_data.get('legalities', {}),
                            'games': card_data.get('games', []),
                            'set': card_data.get('set'),
                            'set_name': card_data.get('set_name'),
                            'set_type': card_data.get('set_type'),
                            'rarity': card_data.get('rarity'),
                            'artist': card_data.get('artist'),
                            'prices': card_data.get('prices', {}),
                            'related_uris': card_data.get('related_uris', {}),
                        }
                        card, _ = MTGCardsData.objects.update_or_create(
                            id=card_data['id'],
                            defaults=defaults
                        )

                        if 'card_faces' in card_data:
                            for face_data in card_data['card_faces']:
                                face_id = face_data.get('id')
                                if not face_id:
                                    continue
                                face, _ = MTGCardFace.objects.update_or_create(
                                    card=card,
                                    name=face_data['name'],
                                    defaults={
                                        'mana_cost': face_data.get('mana_cost', ''),
                                        'type_line': face_data.get('type_line', ''),
                                        'oracle_text': face_data.get('oracle_text', ''),
                                        'colors': face_data.get('colors', []),
                                        'power': face_data.get('power', ''),
                                        'toughness': face_data.get('toughness', ''),
                                        'artist': face_data.get('artist', ''),
                                        'image_uris': face_data.get('image_uris', {}),
                                    }
                                )
                                card.card_faces.add(face)

                        if 'all_parts' in card_data:
                            for part_data in card_data['all_parts']:
                                part, _ = MTGRelatedCard.objects.update_or_create(
                                    id=part_data['id'],
                                    defaults={
                                        'component': part_data.get('component', ''),
                                        'name': part_data['name'],
                                        'type_line': part_data.get('type_line', ''),
                                        'uri': part_data.get('uri', '')
                                    }
                                )
                                card.all_parts.add(part)

                if not data.get('has_more'):
                    break
                page += 1

            return JsonResponse({'message': 'Cards fetched successfully'}, status=200)

        except requests.HTTPError as http_err:
            return JsonResponse({'error': str(http_err)}, status=http_err.response.status_code)
        except requests.RequestException as req_err:
            return JsonResponse({'error': str(req_err)}, status=500)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)