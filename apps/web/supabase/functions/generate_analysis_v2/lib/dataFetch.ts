// deno-lint-ignore-file
// @ts-nocheck

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

export interface UserContext {
  profile: any;
  labs: any[];
  genes: any[];
}

export async function fetchUserContext(sb:SupabaseClient, userId:string):Promise<UserContext>{
  // Phase-1: minimal implementation – just returns profile row.
  const { data:profile, error } = await sb.from('profiles').select().eq('id', userId).single();
  if(error) throw error;
  return { profile, labs:[], genes:[] };
} 