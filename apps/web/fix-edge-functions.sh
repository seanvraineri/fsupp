#!/bin/bash

echo "Fixing and redeploying Edge Functions..."

# Fix generate_analysis
echo "Fixing generate_analysis..."
sed -i.bak "s/Deno\.env\.get('SERVICE_ROLE_KEY')!/Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!/g" supabase/functions/generate_analysis/index.ts

# Fix parse_upload  
echo "Fixing parse_upload..."
sed -i.bak "s/Deno\.env\.get('SERVICE_ROLE_KEY')!/Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!/g" supabase/functions/parse_upload/index.ts

# Fix process_upload
echo "Fixing process_upload..."
sed -i.bak "s/Deno\.env\.get('SERVICE_ROLE_KEY')!/Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!/g" supabase/functions/process_upload/index.ts

# Fix product_search
echo "Fixing product_search..."
sed -i.bak "s/Deno\.env\.get('SERVICE_ROLE_KEY')!/Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!/g" supabase/functions/product_search/index.ts

# Fix pubmed_citations
echo "Fixing pubmed_citations..."
sed -i.bak "s/Deno\.env\.get('SERVICE_ROLE_KEY')!/Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!/g" supabase/functions/pubmed_citations/index.ts

# Deploy all functions
echo "Deploying fixed functions..."
npx supabase functions deploy generate_analysis --project-ref tcptynohlpggtufqanqg
npx supabase functions deploy parse_upload --project-ref tcptynohlpggtufqanqg  
npx supabase functions deploy process_upload --project-ref tcptynohlpggtufqanqg
npx supabase functions deploy product_search --project-ref tcptynohlpggtufqanqg
npx supabase functions deploy pubmed_citations --project-ref tcptynohlpggtufqanqg

echo "Done! All Edge Functions have been fixed and redeployed." 