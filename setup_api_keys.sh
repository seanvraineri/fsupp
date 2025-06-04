#!/bin/bash

# Script to set up API keys for Supabase Edge Functions
# Usage: ./setup_api_keys.sh

echo "SupplementScribe API Key Setup"
echo "=============================="
echo ""
echo "This script will help you add API keys to your Supabase Edge Functions."
echo "You'll need at least one of the following:"
echo "  - OpenAI API Key"
echo "  - Anthropic/Claude API Key"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Get project reference
read -p "Enter your Supabase project reference (e.g., tcptynohlpggtufqanqg): " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "Error: Project reference is required"
    exit 1
fi

echo ""
echo "Which API key would you like to add?"
echo "1) OpenAI API Key"
echo "2) Anthropic/Claude API Key"
echo "3) Both"
read -p "Enter your choice (1-3): " CHOICE

case $CHOICE in
    1)
        read -p "Enter your OpenAI API Key: " OPENAI_KEY
        if [ ! -z "$OPENAI_KEY" ]; then
            echo "Setting OPENAI_API_KEY..."
            supabase secrets set OPENAI_API_KEY="$OPENAI_KEY" --project-ref "$PROJECT_REF"
            echo "✓ OpenAI API Key set successfully"
        fi
        ;;
    2)
        read -p "Enter your Anthropic/Claude API Key: " ANTHROPIC_KEY
        if [ ! -z "$ANTHROPIC_KEY" ]; then
            echo "Setting ANTHROPIC_API_KEY..."
            supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_KEY" --project-ref "$PROJECT_REF"
            echo "✓ Anthropic API Key set successfully"
        fi
        ;;
    3)
        read -p "Enter your OpenAI API Key: " OPENAI_KEY
        if [ ! -z "$OPENAI_KEY" ]; then
            echo "Setting OPENAI_API_KEY..."
            supabase secrets set OPENAI_API_KEY="$OPENAI_KEY" --project-ref "$PROJECT_REF"
            echo "✓ OpenAI API Key set successfully"
        fi
        
        read -p "Enter your Anthropic/Claude API Key: " ANTHROPIC_KEY
        if [ ! -z "$ANTHROPIC_KEY" ]; then
            echo "Setting ANTHROPIC_API_KEY..."
            supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_KEY" --project-ref "$PROJECT_REF"
            echo "✓ Anthropic API Key set successfully"
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "API keys have been set. The Edge Functions will restart automatically."
echo "It may take a few minutes for the changes to take effect."
echo ""
echo "To verify your secrets are set, run:"
echo "  supabase secrets list --project-ref $PROJECT_REF" 
