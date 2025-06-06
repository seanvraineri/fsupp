import { Ingredient } from "./ingredients.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface PersonalScore { score:number; bullets:string[] }

interface UserCtx {
  assessment?:{ allergies?:string[]; goals?:string[] };
  labs?: any[]; // simplified
  genetics?: any;
  supplements?: any[];
}

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function fetchContext(uid:string):Promise<UserCtx>{
  const { data } = await sb.rpc("get_full_user_context", { _uid: uid });
  return (data as any)?.ctx ?? {};
}

export async function scorePersonal(user_id:string, ingredients:Ingredient[]):Promise<PersonalScore>{
  const ctx = await fetchContext(user_id);
  let score = 80;
  const bullets:string[]=[];

  // allergy check
  const allergies:string[] = ctx.assessment?.allergies ?? [];
  const conflicts = ingredients.filter(ing=> allergies.some(a=> ing.name.toLowerCase().includes(a.toLowerCase())));
  if(conflicts.length){
    score -= 30;
    bullets.push(`Possible allergy conflict: ${conflicts.map(c=>c.name).join(', ')}`);
  }

  // good ingredients
  const goodPct = ingredients.filter(i=>i.quality==="good").length / ingredients.length;
  score += Math.round(goodPct*10);

  /* ---------- Lab Biomarkers ---------- */
  const labs = ctx.labs?.[0] ?? {} as Record<string,number>; // expect flattened numeric values
  const low = (name:string, thresh:number)=> typeof labs[name]==="number" && labs[name] < thresh;
  const high = (name:string, thresh:number)=> typeof labs[name]==="number" && labs[name] > thresh;

  if(low("vitamin_d",30)){
    score -= 10;
    bullets.push("Low vitamin D level detected (lab) – product containing D3 may help.");
  }
  if(low("magnesium",1.8)){
    score += 5; // product with magnesium is beneficial
    bullets.push("Magnesium appears low; magnesium-containing product is a plus.");
  }
  if(high("cholesterol_total",200)){
    score -= 5;
    bullets.push("Elevated cholesterol – consult healthcare provider about supplement choice.");
  }

  /* ---------- Genetics ---------- */
  const genes = ctx.genetics ?? {};
  if(genes.mthfr_c677t?.toUpperCase?.() === "TT"){
    score += 5;
    bullets.push("MTHFR TT variant – methylated forms in product beneficial.");
  }
  if(Array.isArray(genes.vdr_variants) && genes.vdr_variants.includes("FokI")){
    bullets.push("VDR variant detected – adequate vitamin D in product is important.");
  }

  // clamp
  score = Math.min(100, Math.max(0, score));
  if(bullets.length===0) bullets.push("No direct conflicts detected.");
  return { score, bullets };
} 
