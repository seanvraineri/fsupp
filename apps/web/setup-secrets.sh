#!/bin/bash

# This script helps you set up the required secrets for SupplementScribe Edge Functions

echo "Setting up Supabase Edge Function secrets..."
echo ""
echo "You need to provide:"
echo "1. OPENAI_API_KEY - For AI analysis and recommendations"
echo "2. PUBMED_API_KEY - For enriching recommendations with research citations"
echo ""
echo "Your PUBMED_API_KEY is: 7138df72900ef4d523298bd50479bb7f1908"
echo ""

# Set the OpenAI API key
read -p "Enter your OPENAI_API_KEY: " OPENAI_API_KEY

# Set secrets using Supabase CLI
echo ""
echo "Setting secrets in your Supabase project..."

# First, login to Supabase if not already logged in
npx supabase login

# Set the secrets
npx supabase secrets set OPENAI_API_KEY=$OPENAI_API_KEY --project-ref tcptynohlpggtufqanqg
npx supabase secrets set PUBMED_API_KEY=7138df72900ef4d523298bd50479bb7f1908 --project-ref tcptynohlpggtufqanqg

echo ""
echo "Secrets have been set! Listing all secrets to confirm:"
npx supabase secrets list --project-ref tcptynohlpggtufqanqg

echo ""
echo "Setup complete! Your Edge Functions should now work properly."
echo ""
echo "Don't forget to:"
echo "1. Create apps/web/.env.local with the following content:"
echo "   NEXT_PUBLIC_SUPABASE_URL=https://tcptynohlpggtufqanqg.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0"
echo ""
echo "2. Restart your development server with: cd apps/web && npm run dev" 