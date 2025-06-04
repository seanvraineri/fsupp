// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const results = {
      env_vars: {
        SUPABASE_URL: !!SUPABASE_URL,
        SERVICE_ROLE_KEY: !!SERVICE_ROLE_KEY,
        SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
      },
      key_lengths: {
        SERVICE_ROLE_KEY: SERVICE_ROLE_KEY?.length || 0,
        SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      },
      test_results: {}
    };

    // Test SERVICE_ROLE_KEY
    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      try {
        const client1 = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
        const { error: error1 } = await client1.from('health_assessments').select('id').limit(1);
        results.test_results.SERVICE_ROLE_KEY = error1 ? `Error: ${error1.message}` : "Success";
      } catch (e) {
        results.test_results.SERVICE_ROLE_KEY = `Exception: ${e.message}`;
      }
    }

    // Test SUPABASE_SERVICE_ROLE_KEY
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const client2 = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { error: error2 } = await client2.from('health_assessments').select('id').limit(1);
        results.test_results.SUPABASE_SERVICE_ROLE_KEY = error2 ? `Error: ${error2.message}` : "Success";
      } catch (e) {
        results.test_results.SUPABASE_SERVICE_ROLE_KEY = `Exception: ${e.message}`;
      }
    }

    return new Response(JSON.stringify(results, null, 2), {
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
