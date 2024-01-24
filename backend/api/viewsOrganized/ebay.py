from decouple import Config, RepositoryEnv
from pathlib import Path
import requests
from django.http import JsonResponse

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_file = BASE_DIR / '.env'
config = Config(RepositoryEnv(env_file))

def fetch_ebay_data(request):
    try:
        search_term = request.GET.get('searchTerm', 'default search term')
        url = "https://svcs.sandbox.ebay.com/services/search/FindingService/v1"
        params = {
            'OPERATION-NAME': 'findItemsByKeywords',
            'SERVICE-VERSION': '1.0.0',
            'SECURITY-APPNAME': config('EBAY_API_KEY'),
            'RESPONSE-DATA-FORMAT': 'JSON',
            'REST-PAYLOAD': '',
            'keywords': search_term
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        return JsonResponse(response.json())
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)