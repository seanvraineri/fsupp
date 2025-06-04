# SupplementScribe Setup Fix Guide

## Current Issues
Your app isn't working because:
1. Missing environment variables in the frontend (.env.local)
2. Missing API keys in Supabase Edge Functions (OPENAI_API_KEY and PUBMED_API_KEY)
3. Possible missing database schema/data

## Quick Fix Steps

### 1. Create Frontend Environment Variables
Create a file `apps/web/.env.local` with:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tcptynohlpggtufqanqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTgyMDUsImV4cCI6MjA2Mzc3NDIwNX0.q9MsmKQAoIUUtyFNE86U9mBupzBboDJO6T1oChtV2E0
```

### 2. Set Edge Function Secrets
Run the setup script:
```bash
cd apps/web
./setup-secrets.sh
```

Or manually set them:
```bash
npx supabase secrets set OPENAI_API_KEY=your_openai_key --project-ref tcptynohlpggtufqanqg
npx supabase secrets set PUBMED_API_KEY=7138df72900ef4d523298bd50479bb7f1908 --project-ref tcptynohlpggtufqanqg
```

### 3. Restart the Development Server
```bash
cd apps/web
npm run dev
```

### 4. Test the App
1. Go to http://localhost:3000
2. Sign up/login
3. Complete the health assessment questionnaire
4. After submitting, go to Recommendations page
5. Click "Generate My Plan" to trigger AI analysis

## What Each Edge Function Does

- **generate_analysis**: Main AI engine that creates supplement recommendations
- **parse_upload**: Manually parses genetic/lab files when triggered
- **process_upload**: Auto-parses files (for Storage hooks - not working due to UI bug)
- **product_search**: Finds product links (uses placeholder xAI endpoint)
- **pubmed_citations**: Enriches recommendations with research citations
- **ai_chat**: Powers the AI chat feature

## Verifying Everything Works

### Check Edge Function Logs
```bash
npx supabase functions logs --project-ref tcptynohlpggtufqanqg
```

### Check Database Tables
The app needs these tables (already created):
- health_assessments
- genetic_markers
- lab_biomarkers
- ai_analyses
- supplement_recommendations
- product_links
- recommendation_citations
- supplement_intake
- chat_conversations
- chat_messages

## Common Issues

### "No completed assessment"
- Make sure you complete the entire questionnaire (all 5 steps)
- Check that the assessment is marked as `is_complete: true` in the database

### "AI error" or "OpenAI error"
- Your OPENAI_API_KEY is not set or invalid
- Check edge function logs for specific error

### Chat not working
- The ai_chat function needs OPENAI_API_KEY
- Check if chat_conversations table has entries

### File upload not processing
- Storage hooks can't be set via UI (known Supabase bug)
- Use manual parsing by calling parse_upload edge function

## Need Your OpenAI API Key?
Get one from: https://platform.openai.com/api-keys 
