#!/bin/bash

echo "Setting up Search API keys for product search fallback..."
echo ""
echo "The product search will try in this order:"
echo "1. xAI API (if configured)"
echo "2. SERP API (recommended fallback)"
echo "3. Google Custom Search API"
echo "4. Direct retailer links (Amazon, iHerb, Vitacost)"
echo ""
echo "You can get a SERP API key from: https://serpapi.com"
echo "You can get a Google API key from: https://console.cloud.google.com/apis/credentials"
echo ""

# Check if SERP API key should be set
read -p "Do you have a SERP API key? (y/n): " HAS_SERP
if [[ $HAS_SERP == "y" || $HAS_SERP == "Y" ]]; then
  read -p "Enter your SERP_API_KEY: " SERP_API_KEY
  npx supabase secrets set SERP_API_KEY=$SERP_API_KEY --project-ref tcptynohlpggtufqanqg
  echo "SERP API key set!"
fi

# Check if Google API key should be set
echo ""
read -p "Do you have a Google Custom Search API key? (y/n): " HAS_GOOGLE
if [[ $HAS_GOOGLE == "y" || $HAS_GOOGLE == "Y" ]]; then
  read -p "Enter your GOOGLE_API_KEY: " GOOGLE_API_KEY
  npx supabase secrets set GOOGLE_API_KEY=$GOOGLE_API_KEY --project-ref tcptynohlpggtufqanqg
  echo "Google API key set!"
  echo ""
  echo "Note: You'll also need to update the CX_ID in the product_search function"
  echo "Get your Custom Search Engine ID from: https://programmablesearchengine.google.com"
fi

echo ""
echo "Redeploying product_search function with enhanced search..."
npx supabase functions deploy product_search --project-ref tcptynohlpggtufqanqg

echo ""
echo "Setup complete! Product search will now use real search APIs instead of mock data." 
