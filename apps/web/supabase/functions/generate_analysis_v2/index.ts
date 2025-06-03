// deno-lint-ignore-file
// @ts-nocheck
// generate_analysis_v2 index – Phase-1 scaffold

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import { fetchUserContext } from "./lib/dataFetch.ts";

interface AnalysisRequest { user_id: string; }

interface AnalysisResult { status: "ok"|"error"; user_id:string; plan:any[]; blocked_recommendations:string[]; error_msg?:string }

Deno.serve(async (req:Request)=>{
  if(req.method!=="POST") return new Response("Method Not Allowed",{status:405});
  if(Deno.env.get("USE_ANALYSIS_V2")!=="true") return new Response(JSON.stringify({error:"analysis_v2 disabled"}),{status:503,headers:{"Content-Type":"application/json"}});

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
  if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY) return new Response(JSON.stringify({error:"Missing env"}),{status:500});
  const sb = createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY);

  let body:AnalysisRequest;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({error:"Invalid JSON"}),{status:400}); }
  if(!body.user_id) return new Response(JSON.stringify({error:"user_id required"}),{status:400});

  const context = await fetchUserContext(sb, body.user_id);
  // Phase-1: return empty plan, no DB insert yet
  const result:AnalysisResult = { status:"ok", user_id: body.user_id, plan:[], blocked_recommendations:[] };
  return new Response(JSON.stringify(result),{status:200,headers:{"Content-Type":"application/json"}});
}); 