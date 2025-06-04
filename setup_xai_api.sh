#!/bin/bash

echo "🤖 Setting up XAI API for Enhanced SupplementScribe AI"
echo "=============================================="
echo ""
echo "XAI's Grok model provides:"
echo "✅ Less cautious, more direct responses"
echo "✅ Better personality and conversational flow"
echo "✅ More actionable supplement advice"
echo ""
echo "Get your XAI API key from: https://console.x.ai/"
echo ""

# Get the XAI API key
read -p "Enter your XAI API key: " XAI_API_KEY

if [ -z "$XAI_API_KEY" ]; then
    echo "❌ Error: XAI API key is required"
    exit 1
fi

echo ""
echo "Setting XAI API key in your Supabase project..."

# Set the secret using Supabase CLI
npx supabase secrets set XAI_API_KEY="$XAI_API_KEY" --project-ref tcptynohlpggtufqanqg

echo ""
echo "✅ XAI API key configured!"
echo ""
echo "Your enhanced AI chatbot now features:"
echo "🧠 Dr. SupplementScribe personality with PhD expertise"
echo "📚 PubMed research citations (PMID references)"
echo "🎯 Deep personalization using your health profile"
echo "💬 Conversation memory across multiple chats"
echo "🔬 Biomarker and genetic data integration"
echo "💊 Current supplement regimen awareness"
echo ""
echo "Test it out in your app's AI Chat section!"
echo ""
echo "💡 Note: The system will fallback to OpenAI if XAI is unavailable" 