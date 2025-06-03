#!/bin/bash

echo "🚀 Setting up SupplementScribe Local Development"
echo "=============================================="

# Prompt user for Supabase credentials instead of committing secrets
read -p "Enter your Supabase project URL: " SUPABASE_URL
read -p "Enter your Supabase anon key: " SUPABASE_ANON_KEY

# Create .env.local file
echo "Creating apps/web/.env.local..."
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
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