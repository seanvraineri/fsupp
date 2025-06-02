#!/bin/bash

echo "🚀 Setting up SupplementScribe Local Development"
echo "=============================================="

# Create .env.local file
echo "Creating apps/web/.env.local..."
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://tcptynohlpggtufqanqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0
EOF

echo "✅ Environment file created"

# Install dependencies
echo ""
echo "Installing dependencies..."
cd apps/web
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server:"
echo "  cd apps/web"
echo "  npm run dev"
echo ""
echo "Then visit http://localhost:3000"
echo ""
echo "⚠️  IMPORTANT: Your app must call the Supabase Edge Functions, NOT local API routes!"
echo ""
echo "Edge Function URLs:"
echo "- AI Chat: https://tcptynohlpggtufqanqg.supabase.co/functions/v1/ai_chat"
echo "- Product Search: https://tcptynohlpggtufqanqg.supabase.co/functions/v1/product_search"
echo "- Generate Analysis: https://tcptynohlpggtufqanqg.supabase.co/functions/v1/generate_analysis" 