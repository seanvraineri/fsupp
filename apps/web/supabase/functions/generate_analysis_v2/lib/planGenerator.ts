// deno-lint-ignore-file
// @ts-nocheck

import { UserContext } from "./dataFetch.ts";
import { summariseLabs, summariseComprehensiveLabs, identifyLabConcerns } from "./labs.ts";
import { summariseGenes, summariseComprehensiveGenes, identifyGeneticConcerns, generateGeneticSupplementRecommendations } from "./genes.ts";
import { callOpenAI } from "./llm.ts";
import { getRagContext } from "./rag.ts";

export interface PlanItem {
  supplement:string;
  purpose:string;
  dosage:string;
  timing:string;
  evidence:string;
  citations:string[];
  product_link?:string;
  brand?:string;
  price?:number;
}

export async function generatePlan(ctx:UserContext, sb:any): Promise<{ plan:PlanItem[]; tokens:number; costUsd:number; raw:string; }> {
  const profileText = ctx.profile?.summary ?? JSON.stringify(ctx.profile);
  
  // USE COMPREHENSIVE DATA (not limited legacy format) ==================
  const labsText = ctx.comprehensiveLabs?.length > 0 
    ? summariseComprehensiveLabs(ctx.comprehensiveLabs)
    : summariseLabs(ctx.labs); // fallback to legacy
    
  const genesText = ctx.comprehensiveGenes?.length > 0
    ? summariseComprehensiveGenes(ctx.comprehensiveGenes)
    : summariseGenes(ctx.genes); // fallback to legacy

  // IDENTIFY SPECIFIC CONCERNS FROM COMPREHENSIVE DATA ==================
  const labConcerns = ctx.comprehensiveLabs?.length > 0 
    ? identifyLabConcerns(ctx.comprehensiveLabs)
    : [];
    
  const geneticConcerns = ctx.comprehensiveGenes?.length > 0
    ? identifyGeneticConcerns(ctx.comprehensiveGenes)
    : [];
    
  const geneticRecommendations = ctx.comprehensiveGenes?.length > 0
    ? generateGeneticSupplementRecommendations(ctx.comprehensiveGenes)
    : [];

  // BUILD COMPREHENSIVE CONTEXT ==========================================
  let comprehensiveContext = `${profileText}\n${labsText}\n${genesText}`;
  
  if (labConcerns.length > 0) {
    comprehensiveContext += `\n\n**IDENTIFIED LAB CONCERNS:**\n${labConcerns.join('\n')}`;
  }
  
  if (geneticConcerns.length > 0) {
    comprehensiveContext += `\n\n**GENETIC CONSIDERATIONS:**\n${geneticConcerns.join('\n')}`;
  }
  
  if (geneticRecommendations.length > 0) {
    comprehensiveContext += `\n\n**GENETIC-BASED RECOMMENDATIONS:**\n${geneticRecommendations.join('\n')}`;
  }

  const rag = await getRagContext(comprehensiveContext, sb);

  const systemPrompt = `You are SupplementScribe Analysis v2 with COMPREHENSIVE health data analysis. You have access to complete biomarker panels (not just highlights) and extensive genetic SNP data.

Use this comprehensive health context to create a highly personalized dietary supplement plan based on:
- COMPLETE biomarker analysis (all lab values provided)
- COMPREHENSIVE genetic variants (specific SNPs and their implications)  
- Identified health concerns and genetic predispositions
- Evidence-based supplement recommendations

Focus on addressing specific biomarker abnormalities and genetic variants with targeted supplementation. Use precise dosages based on the individual's complete health profile.

${rag.textBlock}

Return ONLY valid JSON array where each element has keys: supplement, purpose, dosage, timing, evidence, citations (array of PubMed IDs).`;

  const userMessage = `COMPREHENSIVE HEALTH PROFILE:

${comprehensiveContext}

Please analyze this COMPLETE health data and provide targeted supplement recommendations based on the specific biomarker values and genetic variants shown.`;

  const llmRes = await callOpenAI(systemPrompt, userMessage);

  let plan:PlanItem[] = [];
  try {
    plan = JSON.parse(llmRes.text);
  } catch(_){
    console.warn("LLM returned non-JSON; wrapping as text block");
  }

  // attach purchase links
  await Promise.all(plan.map(async (item)=>{
    const { data } = await sb.from('product_links')
      .select('brand, product_url, price')
      .eq('supplement_name', item.supplement)
      .order('price',{ascending:true})
      .limit(1)
      .maybeSingle();
    if(data){
      item.brand = data.brand;
      item.product_link = data.product_url;
      item.price = Number(data.price);
    }
  }));

  return { plan, tokens: llmRes.tokens, costUsd: llmRes.costUsd, raw: llmRes.text };
} 
