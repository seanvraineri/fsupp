import { Ingredient } from "./ingredients.ts";
import { createClient } from "@supabase/supabase-js";

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

  // clamp
  score = Math.min(100, Math.max(0, score));
  if(bullets.length===0) bullets.push("No direct conflicts detected.");
  return { score, bullets };
} 
