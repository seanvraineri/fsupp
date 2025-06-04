// deno-lint-ignore-file no-explicit-any
// Main orchestrator for Product Checker Edge Function
// See README in requirements for the full pipeline spec.

// @ts-expect-error deno runtime import
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { resolveProduct } from "./lib/resolver.ts";
import { getIngredients } from "./lib/ingredients.ts";
import { getClaims } from "./lib/claims.ts";
import { scoreScience } from "./lib/science.ts";
import { scorePersonal } from "./lib/personal.ts";
import { combineScore, emojiFor } from "./lib/score.ts";
import { getCache, setCache, logRun } from "./lib/cache.ts";

interface Payload{ user_id:string; text?:string; url?:string; image_base64?:string; stream?:boolean }

serve(async (req)=>{
  const started = performance.now();
  let tokens=0;
  let cache_hit=false;
  let product_id="unknown";
  let user_id="";
  try{
    const payload:Payload = await req.json();
    user_id = payload.user_id;
    // validate exactly one source field
    const provided = [payload.text,payload.url,payload.image_base64].filter(Boolean).length;
    if(provided!==1) return new Response("provide exactly one of text,url,image_base64",{status:400});

    // Resolver → returns {id, name, brand, html, labelText}
    const prod = await resolveProduct(payload);
    product_id = prod.id;

    // Cache check (7-day)
    const cached = await getCache(user_id,product_id);
    if(cached){
      cache_hit=true;
      await logRun({user_id,product_id,ms:Math.round(performance.now()-started),tokens_used:0,cache_hit:true});
      return new Response(JSON.stringify(cached),{headers:{"Content-Type":"application/json"}});
    }

    /* ---------- Pipeline ---------- */
    const ingredients = await getIngredients(prod);
    const claims = await getClaims(prod);
    const scienceScore = await scoreScience(claims); // returns {score, evidence}
    const personalScore = await scorePersonal(user_id,ingredients);
    const overall = combineScore(scienceScore.score,personalScore.score);

    const verdict = {
      product:{name:prod.name,brand:prod.brand,id:prod.id},
      score:overall,
      emoji:emojiFor(overall),
      science:scienceScore,
      personal:personalScore,
      ingredients,
      claims,
    };

    await setCache(user_id,product_id,verdict);
    await logRun({user_id,product_id,ms:Math.round(performance.now()-started),tokens_used:tokens,cache_hit:false});

    return new Response(JSON.stringify(verdict),{headers:{"Content-Type":"application/json"}});
  }catch(err:any){
    console.error(err);
    await logRun({user_id,product_id,ms:Math.round(performance.now()-started),tokens_used:tokens,cache_hit,err:err.message?.slice(0,200)});
    return new Response("internal",{status:500});
  }
}); 
