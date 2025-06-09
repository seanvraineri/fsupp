import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

serve(async (req: Request) => {
  const envVars = {
    SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
    SERVICE_ROLE_KEY: Deno.env.get('SERVICE_ROLE_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY') ? 'SET' : 'NOT_SET',
  };

  return new Response(JSON.stringify(envVars, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}); 