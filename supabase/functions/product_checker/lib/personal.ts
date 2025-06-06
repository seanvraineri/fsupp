import { Ingredient } from "./ingredients.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface PersonalScore { score:number; summary: string; bullets:string[] }

interface UserCtx {
  assessment?:{ allergies?:string[]; goals?:string[] };
  labs?: any[];
  genetics?: any;
  supplements?: any[];
}

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function fetchContext(uid:string):Promise<UserCtx>{
  const { data } = await sb.rpc("get_full_user_context", { _uid: uid });
  return (data as any)?.ctx ?? {};
}

const PERSONALIZE_PROMPT = `
You are a functional medicine expert providing supplement advice.
A user has provided their health context (allergies, goals, labs, genetics) and a supplement's ingredients.
Your task is to analyze the personal fit.
1. Start with a base score of 80.
2. Add or subtract points based on how the ingredients align with the user's context. Explain each adjustment.
3. Generate a list of bullet points highlighting key interactions, benefits, or concerns.
4. Conclude with a brief, 1-2 sentence summary of your analysis.

Respond ONLY in JSON format: {"score": number, "summary": string, "bullets": string[]}

User Context:
"""
{context}
"""

Supplement Ingredients:
"""
{ingredients}
"""
`;

async function scorePersonalWithLLM(ctx: UserCtx, ingredients: Ingredient[]): Promise<PersonalScore> {
  const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_KEY) return { score: 50, summary: "OpenAI key not configured.", bullets: [] };

  const content = PERSONALIZE_PROMPT
    .replace('{context}', JSON.stringify(ctx, null, 2))
    .replace('{ingredients}', JSON.stringify(ingredients, null, 2));
  
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content }],
      max_tokens: 400,
      temperature: 0.2,
      response_format: { type: "json_object" },
    })
  });

  if (!r.ok) return { score: 50, summary: "Failed to query OpenAI.", bullets: ["Could not get a personalized analysis at this time."] };
  
  try {
    const j = await r.json();
    return JSON.parse(j.choices[0].message.content);
  } catch (e) {
    console.error("Failed to parse personal score response:", e);
    return { score: 50, summary: "Could not parse the personalization response.", bullets: [] };
  }
}

export async function scorePersonal(user_id:string, ingredients:Ingredient[]):Promise<PersonalScore>{
  const ctx = await fetchContext(user_id);
  
  if (!ctx || Object.keys(ctx).length === 0) {
    let score = 80;
    const bullets:string[]=[];
    const goodPct = ingredients.filter(i=>i.quality==="good").length / ingredients.length;
    score += Math.round(goodPct*10);
    score = Math.min(100, Math.max(0, score));
    if(bullets.length===0) bullets.push("No personal health data provided for a full analysis.");
    return { score, summary: "A personalized analysis requires your health profile.", bullets };
  }

  return await scorePersonalWithLLM(ctx, ingredients);
} 