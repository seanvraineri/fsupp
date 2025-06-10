#!/bin/bash

echo "Fixing and redeploying Edge Functions..."

# Fix generate_analysis
echo "Fixing generate_analysis..."
sed -i.bak "s/Deno\.env\.get('SERVICE_ROLE_KEY')!/Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!/g" supabase/functions/generate_analysis/index.ts

# Fix parse_upload  
echo "Fixing parse_upload..."
sed -i.bak "s/Deno\.env\.get('SERVICE_ROLE_KEY')!/Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!/g" supabase/functions/parse_upload/index.ts

# process_upload was removed - duplicate of parse_upload

# product_search and pubmed_citations were removed - unnecessary complexity

# Deploy all functions
echo "Deploying fixed functions..."
npx supabase functions deploy generate_analysis --project-ref tcptynohlpggtufqanqg
npx supabase functions deploy parse_upload --project-ref tcptynohlpggtufqanqg
npx supabase functions deploy ai_chat --project-ref tcptynohlpggtufqanqg
npx supabase functions deploy embedding_worker --project-ref tcptynohlpggtufqanqg

echo "Done! All Edge Functions have been fixed and redeployed." 
