// @ts-nocheck
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(){
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"unauthorized"},{status:401});
  const { data, error } = await supabase.from("symptom_logs").select("*").eq("user_id",user.id).order("logged_at",{ascending:false}).limit(30);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({logs:data});
}

export async function POST(req:Request){
  const body = await req.json();
  const { date, positive=false, symptoms={}, note="" } = body;
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"unauthorized"},{status:401});
  const entries = Object.entries(symptoms).map(([name,severity])=>({
    user_id:user.id,
    name,
    severity,
    positive,
    note,
    logged_at: date ?? new Date().toISOString()
  }));
  const { error } = await supabase.from("symptom_logs").insert(entries);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
} 
