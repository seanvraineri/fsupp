// deno-lint-ignore-file
// @ts-nocheck

import { UserContext } from "./dataFetch.ts";
import { summariseLabs } from "./labs.ts";
import { summariseGenes } from "./genes.ts";
import { callOpenAI } from "./llm.ts";

export interface PlanItem { supplement:string; purpose:string; dosage:string; timing:string; evidence:string; citations:string[]; }

export async function generatePlan(ctx:UserContext): Promise<{ plan:PlanItem[]; tokens:number; costUsd:number; raw:string; }> {
  const profileText = ctx.profile?.summary ?? JSON.stringify(ctx.profile);
  const labsText = summariseLabs(ctx.labs);
  const genesText = summariseGenes(ctx.genes);

  const systemPrompt = `You are SupplementScribe Analysis v2. Use the provided health context to create a personalised dietary supplement plan.\n\nReturn ONLY valid JSON array where each element has keys: supplement, purpose, dosage, timing, evidence, citations (array of PubMed IDs).`;

  const userMessage = `USER PROFILE:\n${profileText}\n\nLAB DATA:\n${labsText}\n\nGENE DATA:\n${genesText}`;

  const llmRes = await callOpenAI(systemPrompt, userMessage);

  let plan:PlanItem[] = [];
  try {
    plan = JSON.parse(llmRes.text);
  } catch(_){
    console.warn("LLM returned non-JSON; wrapping as text block");
  }

  return { plan, tokens: llmRes.tokens, costUsd: llmRes.costUsd, raw: llmRes.text };
} 