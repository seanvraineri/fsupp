# PubMed Citations Function v2

Fetch and store PubMed citations for supplement recommendations with personalized relevance scoring and AI summarization.

## Features

- **PubMed Integration**: Search using eSearch → eSummary → eFetch pipeline
- **Exponential Backoff**: Retry logic for API rate limits and failures
- **24h Caching**: Supabase Storage bucket caching for abstracts
- **Relevance Scoring**: Cosine similarity against user health profile
- **AI Summarization**: Optional OpenAI-powered personalized summaries
- **Database-Safe**: Column introspection and type-safe upserts
- **Idempotent**: Duplicate detection via recommendation_id + pmid

## Architecture

```
index.ts
├── lib/pubmed.ts     - PubMed eUtils API wrapper
├── lib/openai.ts     - GPT summarization (optional)
├── lib/relevance.ts  - Cosine similarity scoring
└── lib/db.ts         - Database operations
```

## Environment Variables

```bash
# Required
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional (for enhanced features)
PUBMED_API_KEY=your-ncbi-api-key
OPENAI_API_KEY=your-openai-key
OPENAI_ORG=your-openai-org-id
```

## Testing

Run all tests:
```bash
deno task test
```

Run specific test file:
```bash
deno test tests/relevance_test.ts
deno test tests/pubmed_test.ts
deno test tests/openai_test.ts
deno test tests/db_test.ts
```

## Deployment

Deploy to Supabase:
```bash
supabase functions deploy pubmed_citations
```

## Usage

POST request with recommendation_id:

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/pubmed_citations' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{"recommendation_id": "uuid-here"}'
```

Response:
```json
{
  "success": true,
  "citations_found": 5,
  "citations_new": 3,
  "recommendation_id": "uuid-here",
  "execution_time_ms": 2500
}
```

## Database Schema

Expects `recommendation_citations` table with columns:
- `recommendation_id` (uuid, FK)
- `pmid` (text, PubMed ID)
- `title` (text)
- `summary` (text)
- `score` (numeric, relevance 0-1)
- `created_at` (timestamp)
- `raw_json` (jsonb, optional extra fields)

Primary key: `(recommendation_id, pmid)`

## Performance

- **Rate Limits**: Handles PubMed 3 requests/second limit
- **Retry Logic**: Exponential backoff up to 5 seconds
- **Batch Processing**: Processes 3 abstracts max per request
- **Caching**: 24h Storage cache reduces API calls
- **Idempotency**: Skips existing citations

## Error Handling

- Graceful degradation (works without OpenAI)
- Structured logging for debugging
- Non-blocking failures (continues with partial results)
- Database column introspection prevents schema errors 
