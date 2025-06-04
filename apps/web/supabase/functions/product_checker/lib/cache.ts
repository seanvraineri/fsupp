import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(supabaseUrl, serviceKey);

export async function getCache(uid:string, pid:string){
  const { data } = await sb.from("product_verdict_cache").select("verdict,updated_at").eq("user_id",uid).eq("product_id",pid).maybeSingle();
  if(!data) return null;
  const ageMs = Date.now() - new Date(data.updated_at).getTime();
  if(ageMs > 7*24*60*60*1000) return null;
  return data.verdict;
}
export async function setCache(uid:string,pid:string,verdict:any){
  await sb.from("product_verdict_cache").upsert({user_id:uid,product_id:pid,verdict});
}
export async function logRun(fields:{user_id:string;product_id:string;ms:number;tokens_used:number;cache_hit:boolean;err?:string}){
  await sb.from("product_checker_logs").insert(fields);
} 
