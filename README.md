# SupplementScribe Monorepo

SupplementScribe is a full-stack platform that converts a user's health data (questionnaire, genetics & labs) into a safe, evidence-backed supplement plan, then helps them adhere to it.

## Packages / Folders

| Path | Description |
|------|-------------|
| `apps/web` | Next.js 14 (App Router) front-end & client APIs |
| `apps/web/supabase/functions` | Edge Functions (Deno) deployed to Supabase |
| `supabase` | SQL schema & migrations (managed via Supabase CLI) |

## Getting started

```bash
# root
npm install

# start Next.js dev server
cd apps/web && npm run dev
```

Environment variables are loaded from `.env.local` in `apps/web` and Edge-Function secrets in the Supabase dashboard.

### Deploying Edge Functions

```
# deploy all functions defined in apps/web/supabase/functions
supabase functions deploy <function-name>
```

### Database migrations

```bash
# create and apply a diff against the hosted DB
supabase db diff --schema public --project-ref <project-ref> | supabase db push
```

## Documentation

See additional design docs in `apps/web/docs/`. 
