from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
import requests
from rest_framework.test import APIClient

class EbayViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()

    @patch('api.viewsOrganized.ebay.requests.get')
    def test_fetch_ebay_data_success(self, mock_get):
        mock_response = {
            'findItemsByKeywordsResponse': [
                {
                    'searchResult': [
                        {'item': [{'title': 'Test Item', 'price': '10.00'}]}
                    ]
                }
            ]
        }
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_response

        url = reverse('fetch_ebay_data')
        response = self.client.get(url, {'searchTerm': 'Test Item'})

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('findItemsByKeywordsResponse', data)
        self.assertEqual(len(data['findItemsByKeywordsResponse'][0]['searchResult'][0]['item']), 1)
        self.assertEqual(data['findItemsByKeywordsResponse'][0]['searchResult'][0]['item'][0]['title'], 'Test Item')

    @patch('api.viewsOrganized.ebay.requests.get')
    def test_fetch_ebay_data_with_default_search_term(self, mock_get):
        mock_response = {
            'findItemsByKeywordsResponse': [
                {
                    'searchResult': [
                        {'item': [{'title': 'Default Item', 'price': '20.00'}]}
                    ]
                }
            ]
        }
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_response

        url = reverse('fetch_ebay_data')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('findItemsByKeywordsResponse', data)
        self.assertEqual(data['findItemsByKeywordsResponse'][0]['searchResult'][0]['item'][0]['title'], 'Default Item')

    @patch('api.viewsOrganized.ebay.requests.get')
    def test_fetch_ebay_data_api_failure(self, mock_get):
        mock_get.side_effect = requests.exceptions.RequestException("API error")

        url = reverse('fetch_ebay_data')
        response = self.client.get(url, {'searchTerm': 'Test Item'})

        self.assertEqual(response.status_code, 500)
        data = response.json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'API error')
