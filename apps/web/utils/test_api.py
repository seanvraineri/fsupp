#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json

SERP_API_KEY = 'c473072afcd7d532f4a4b314a3a1c21a2d7538d449f849f4b0994280e05f93c5'
params = {
    'q': 'site:thorne.com Vitamin D3',
    'api_key': SERP_API_KEY,
    'num': 1,
    'engine': 'google'
}
url = 'https://serpapi.com/search.json?' + urllib.parse.urlencode(params)
try:
    print(f"Testing API with URL: {url[:50]}...")
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
        print('API Response received!')
        if 'organic_results' in data:
            print(f'Found {len(data["organic_results"])} results')
            if data["organic_results"]:
                print(f'First result: {data["organic_results"][0].get("title", "No title")}')
        else:
            print('No organic results found')
        if 'error' in data:
            print(f'API Error: {data["error"]}')
except Exception as e:
    print(f'Error: {e}') 