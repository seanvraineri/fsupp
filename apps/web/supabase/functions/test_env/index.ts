// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Check environment variables
    const envVars = {
      SUPABASE_URL: !!Deno.env.get("SUPABASE_URL"),
      SERVICE_ROLE_KEY: !!Deno.env.get("SERVICE_ROLE_KEY"),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      OPENAI_API_KEY: !!Deno.env.get("OPENAI_API_KEY"),
      PUBMED_API_KEY: !!Deno.env.get("PUBMED_API_KEY"),
    };

    // Test basic functionality
    const testResult = {
      env_vars: envVars,
      deno_version: Deno.version.deno,
      timestamp: new Date().toISOString(),
      status: "ok"
    };

    return new Response(JSON.stringify(testResult, null, 2), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Test failed",
      message: error.message,
      stack: error.stack
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
}); 
