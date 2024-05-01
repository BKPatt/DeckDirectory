from django.core.management.base import BaseCommand
from api.tasks import bulk_update_market_values, bulk_update_collection_values

class Command(BaseCommand):
    help = 'Invoke the bulk_update_market_values task'

    def handle(self, *args, **options):
        self.stdout.write('Invoking bulk_update_market_values task...')
        bulk_update_market_values()
        self.stdout.write('Task invoked.')
