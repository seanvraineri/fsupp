#!/bin/bash

echo "Fixing and redeploying all Edge Functions with proper environment variable validation..."
echo ""

# Deploy all functions with the fixes
echo "Deploying fixed functions to Supabase..."
echo ""

echo "1. Deploying generate_analysis..."
npx supabase functions deploy generate_analysis --project-ref tcptynohlpggtufqanqg

echo "2. Deploying parse_upload..."
npx supabase functions deploy parse_upload --project-ref tcptynohlpggtufqanqg

# process_upload was removed - duplicate of parse_upload

echo "4. Deploying ai_chat..."
npx supabase functions deploy ai_chat --project-ref tcptynohlpggtufqanqg

echo ""
echo "All Edge Functions have been deployed!"
echo ""
echo "Testing generate_analysis function..."
curl -s -X POST https://tcptynohlpggtufqanqg.supabase.co/functions/v1/generate_analysis \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "236ad7cd-8b9a-497b-b623-7badd328ce46"}'

echo ""
echo ""
echo "Deployment complete! Check the response above."
echo "If you see 'ok' status, everything is working!" 
