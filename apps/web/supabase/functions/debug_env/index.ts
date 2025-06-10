import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: cors });
  }
  
  const envVars = {
    SUPABASE_URL: !!Deno.env.get("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    SERVICE_ROLE_KEY: !!Deno.env.get("SERVICE_ROLE_KEY"),
    OPENAI_API_KEY: !!Deno.env.get("OPENAI_API_KEY"),
    ANTHROPIC_API_KEY: !!Deno.env.get("ANTHROPIC_API_KEY"),
    CLAUDE_API_KEY: !!Deno.env.get("CLAUDE_API_KEY"),
    XAI_API_KEY: !!Deno.env.get("XAI_API_KEY"),
  };
  
  return new Response(JSON.stringify(envVars, null, 2), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}); 