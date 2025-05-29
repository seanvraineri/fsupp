const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env variables. Check your .env.local file.");
}

import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
