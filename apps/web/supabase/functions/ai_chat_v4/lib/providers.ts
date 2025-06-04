// deno-lint-ignore-file
// @ts-nocheck

interface ProviderResult { text:string; tokens:number; costUsd:number; }

const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_PRICE_PER_1K_TOKENS = 0.01; // placeholder cost

export async function providerCascade(prompt:string, profile:any, rag:any): Promise<ProviderResult> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    return { text: "No provider configured", tokens: 0, costUsd: 0 };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), 6000);

  try {
    const body = {
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(profile, rag) },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 600,
      stream: false
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn("OpenAI error", res.status);
      return { text: "Service unavailable", tokens: 0, costUsd: 0 };
    }

    const json = await res.json();
    const text = json.choices[0].message.content.trim();
    const tokens = json.usage?.total_tokens ?? 600; // fallback
    const cost = (tokens / 1000) * OPENAI_PRICE_PER_1K_TOKENS;
    return { text, tokens, costUsd: cost };
  } catch (e) {
    console.warn("OpenAI fetch error", e);
    return { text: "Service timeout", tokens: 0, costUsd: 0 };
  }
}

function buildSystemPrompt(profile:any, rag:any): string {
  return `You are SupplementScribe AI v4.\nUser profile hash: ${profile.hash}\n${profile.text}${rag.textBlock}\nPlease answer with PubMed citations.`;
}

async function callOpenAI(prompt:string,sys:string,signal:AbortSignal){const key=Deno.env.get("OPENAI_API_KEY");if(!key)throw "no_key";const body={model:OPENAI_MODEL,messages:[{role:"system",content:sys},{role:"user",content:prompt}],temperature:0.7,max_tokens:600,stream:false};const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify(body),signal});if(!r.ok)throw new Error("openai_fail");const j=await r.json();return{text:j.choices[0].message.content.trim(),tokens:j.usage?.total_tokens??600,costUsd:(j.usage?.total_tokens??600)/1000*OPENAI_PRICE_PER_1K_TOKENS};}

async function callClaude(prompt:string,sys:string,signal:AbortSignal){const key=Deno.env.get("ANTHROPIC_API_KEY");if(!key)throw"no_key";const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-3-haiku-20240307",system:sys,messages:[{role:"user",content:prompt}],max_tokens:600,temperature:0.7}),signal});if(!r.ok)throw"claude_fail";const j=await r.json();return{text:j.content[0].text,tokens:600,costUsd:0.02};}

async function callGrok(prompt:string,sys:string,signal:AbortSignal){const key=Deno.env.get("XAI_API_KEY");if(!key)throw"no_key";const r=await fetch("https://api.x.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"grok-beta",messages:[{role:"system",content:sys},{role:"user",content:prompt}],max_tokens:600,temperature:0.7,stream:false}),signal});if(!r.ok)throw"grok_fail";const j=await r.json();return{text:j.choices[0].message.content.trim(),tokens:600,costUsd:0.015};}

async function callWithTimeout(fn,ms){const controller=new AbortController();const timer=setTimeout(()=>controller.abort("timeout"),ms);try{return await fn(controller.signal);}finally{clearTimeout(timer);}} 