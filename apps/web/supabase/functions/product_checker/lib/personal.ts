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

  /* ---------- COMPREHENSIVE LAB BIOMARKERS ANALYSIS ---------- */
  const labs = ctx.labs?.[0] ?? {} as Record<string,number>; // expect flattened numeric values
  const low = (name:string, thresh:number)=> typeof labs[name]==="number" && labs[name] < thresh;
  const high = (name:string, thresh:number)=> typeof labs[name]==="number" && labs[name] > thresh;

  // === VITAMINS (Fat-Soluble) ===
  if(low("vitamin_d",30)){
    score -= 10;
    bullets.push(`💊 **Perfect for Your Vitamin D**: Your vitamin D at ${labs.vitamin_d || 'low'} ng/mL tells us this D3 + K2 combo would work exceptionally well for you - we think this is exactly what your body needs right now.`);
  }
  if(low("vitamin_a",30)){
    score += 5;
    bullets.push(`🥕 **Great Choice for You**: With your vitamin A levels, we believe the retinol in this product would be particularly beneficial for your health profile.`);
  }
  if(low("vitamin_e",12)){
    score += 5;
    bullets.push(`🛡️ **Antioxidant Support You Need**: Your vitamin E levels suggest this mixed tocopherol formula would work really well for your antioxidant needs.`);
  }
  if(low("vitamin_k",0.4)){
    score += 5;
    bullets.push(`🦴 **Bone Health Boost**: We think the K2 (MK-7) in this product would be particularly effective for your current vitamin K status.`);
  }

  // === B-VITAMINS ===
  if(low("vitamin_b12",400)){
    score -= 8;
    bullets.push("Low B12 (${labs.vitamin_b12} pg/mL) – methylcobalamin in product highly beneficial.");
  }
  if(low("folate",6)){
    score -= 8;
    bullets.push("Low folate – L-methylfolate in product highly beneficial.");
  }
  if(low("thiamine",70)){
    score += 5;
    bullets.push("Low thiamine – B1 in product beneficial.");
  }
  if(low("vitamin_c",11)){
    score += 5;
    bullets.push("Low vitamin C – ascorbic acid + bioflavonoids in product beneficial.");
  }

  // === MINERALS ===
  if(low("magnesium",1.8) || low("rbc_magnesium",4.2)){
    score += 8;
    bullets.push("Low magnesium – glycinate form in product is excellent choice.");
  }
  if(low("zinc",70) || low("rbc_zinc",12)){
    score += 5;
    bullets.push("Low zinc – picolinate form in product beneficial.");
  }
  if(low("iron",60) || low("ferritin",30)){
    score += 8;
    bullets.push("Low iron/ferritin – iron bisglycinate in product highly beneficial.");
  }
  if(high("ferritin",200)){
    score -= 15;
    bullets.push("⚠️ High ferritin (${labs.ferritin} ng/mL) – AVOID iron in products!");
  }
  if(low("selenium",95)){
    score += 5;
    bullets.push("Low selenium – selenomethionine in product beneficial.");
  }
  if(low("calcium",8.5)){
    score += 5;
    bullets.push("Low calcium – citrate form with D3 + K2 in product beneficial.");
  }

  // === HORMONES ===
  if(high("tsh",3.0)){
    score += 5;
    bullets.push("Elevated TSH (${labs.tsh} mIU/L) – thyroid support nutrients beneficial.");
  }
  if(low("free_t3",3.0)){
    score += 5;
    bullets.push("Low free T3 – tyrosine + selenium + zinc in product beneficial.");
  }
  if(low("testosterone",350)){
    score += 5;
    bullets.push("Low testosterone – testosterone support nutrients beneficial.");
  }

  // === LIPIDS ===
  if(high("ldl",100)){
    score += 8;
    bullets.push("Elevated LDL (${labs.ldl} mg/dL) – plant sterols + red yeast rice beneficial.");
  }
  if(low("hdl",50)){
    score += 5;
    bullets.push("Low HDL (${labs.hdl} mg/dL) – niacin + omega-3 in product beneficial.");
  }
  if(high("triglycerides",150)){
    score += 8;
    bullets.push("High triglycerides (${labs.triglycerides} mg/dL) – high-EPA fish oil beneficial.");
  }
  if(high("cholesterol_total",200)){
    score -= 5;
    bullets.push("Elevated cholesterol – consult healthcare provider about supplement choice.");
  }

  // === METABOLIC ===
  if(high("glucose",99)){
    score += 8;
    bullets.push("Elevated glucose (${labs.glucose} mg/dL) – berberine + chromium beneficial.");
  }
  if(high("hba1c",5.6)){
    score += 8;
    bullets.push("Elevated HbA1c (${labs.hba1c}%) – alpha-lipoic acid + chromium beneficial.");
  }

  // === INFLAMMATION ===
  if(high("crp",3.0) || high("hs_crp",3.0)){
    score += 8;
    bullets.push("Elevated inflammation – curcumin + omega-3 in product highly beneficial.");
  }

  // === AMINO ACIDS ===
  if(high("homocysteine",10)){
    score += 8;
    bullets.push("High homocysteine (${labs.homocysteine} μmol/L) – B-complex + TMG beneficial.");
  }

  // === FATTY ACIDS ===
  if(low("omega_3_index",4.0)){
    score += 8;
    bullets.push("Low omega-3 index – EPA/DHA in product highly beneficial.");
  }

  /* ---------- COMPREHENSIVE GENETICS ANALYSIS ---------- */
  const genes = ctx.genetics ?? {};
  const supplements_lower = ingredients.map(i => i.name.toLowerCase()).join(' ');

  // === METHYLATION & FOLATE PATHWAY ===
  if(genes.mthfr_c677t?.toUpperCase?.() === "TT" || genes.mthfr_c677t?.toUpperCase?.() === "CT"){
    if(supplements_lower.includes('methylfolate') || supplements_lower.includes('5-mthf') || supplements_lower.includes('l-methylfolate')){
      score += 10;
      bullets.push(`🧬 **PERFECT for Your MTHFR Genetics**: Your MTHFR ${genes.mthfr_c677t} variant means the methylfolate in this product is EXACTLY what your body needs - we couldn't have chosen better for your unique genetics!`);
    } else if(supplements_lower.includes('folic acid')){
      score -= 10;
      bullets.push(`⚠️ **Your MTHFR Genetics Need Different**: With your MTHFR ${genes.mthfr_c677t} variant, we think methylfolate would work much better for you than the folic acid in this product.`);
    }
    if(supplements_lower.includes('methylcobalamin') || supplements_lower.includes('methyl b12')){
      score += 8;
      bullets.push(`🚀 **Ideal B12 for Your Genetics**: The methylcobalamin in this product is specifically what we'd recommend for your MTHFR variant - this form will work best with your genetic makeup!`);
    }
  }
  
  if(genes.mthfr_a1298c?.toUpperCase?.() === "CC" || genes.mthfr_a1298c?.toUpperCase?.() === "AC"){
    if(supplements_lower.includes('methylfolate')){
      score += 8;
      bullets.push("🧬 MTHFR A1298C variant – methylfolate in product beneficial!");
    }
  }

  // === NEUROTRANSMITTER & MOOD ===
  if(genes.comt?.toUpperCase?.() === "AA" || supplements_lower.includes('val158met aa')){
    if(supplements_lower.includes('magnesium')){
      score += 8;
      bullets.push(`🧠 **Magnesium Made for Your COMT**: Your COMT slow variant means the magnesium in this product will work particularly well for you - we think this will be excellent for supporting your dopamine balance and stress response!`);
    }
    if(supplements_lower.includes('same') && !supplements_lower.includes('low dose')){
      score -= 5;
      bullets.push(`⚠️ **Caution with Your COMT Genetics**: Your COMT slow variant suggests the high-dose SAMe in this product might cause overmethylation - we think a lower dose would work better for your genetics.`);
    }
  }
  
  if(genes.comt?.toUpperCase?.() === "GG"){
    if(supplements_lower.includes('tyrosine') || supplements_lower.includes('l-tyrosine')){
      score += 8;
      bullets.push(`⚡ **Tyrosine Tailored for You**: With your COMT fast variant, the tyrosine in this product is exactly what we'd choose to support your dopamine production - this will work really well for your genetics!`);
    }
  }

  // === VITAMIN D PATHWAY ===
  if(genes.vdr_variants?.includes("rs2228570 CC") || genes.vdr_variants?.includes("FokI")){
    if(supplements_lower.includes('vitamin d') && (supplements_lower.includes('5000') || supplements_lower.includes('4000'))){
      score += 8;
      bullets.push(`☀️ **Higher Dose Perfect for Your VDR**: Your VDR genetic variant means the higher dose vitamin D in this product is exactly what you need - we think this dosage will work much better for your genetics than standard amounts!`);
    } else if(supplements_lower.includes('vitamin d')){
      score += 5;
      bullets.push(`💡 **Good Vitamin D Choice**: The vitamin D in this product is beneficial for your VDR variant, though we think you might need higher doses than average for optimal results.`);
    }
  }

  // === OMEGA-3 METABOLISM ===
  if(genes.fads1?.includes("TT") || genes.fads2?.includes("GG")){
    if(supplements_lower.includes('epa') || supplements_lower.includes('dha') || supplements_lower.includes('fish oil')){
      score += 10;
      bullets.push("🧬 FADS variant – preformed EPA/DHA in product ESSENTIAL for your genetics!");
    } else if(supplements_lower.includes('ala') || supplements_lower.includes('flax')){
      score -= 5;
      bullets.push("⚠️ FADS variant – you cannot convert ALA efficiently, need EPA/DHA instead!");
    }
  }

  // === IRON METABOLISM ===
  if(genes.hfe?.includes("C282Y AA") || genes.hfe?.includes("H63D CC")){
    if(supplements_lower.includes('iron')){
      score -= 20;
      bullets.push("🚨 HFE hemochromatosis variant – NEVER take iron supplements!");
    } else {
      score += 5;
      bullets.push("✅ HFE variant detected – good that product avoids iron!");
    }
  }

  // === DETOXIFICATION ===
  if(genes.gstm1 === "null" || genes.gstt1 === "null"){
    if(supplements_lower.includes('nac') || supplements_lower.includes('n-acetyl-cysteine')){
      score += 8;
      bullets.push("🧬 GST null variant – NAC in product excellent for detoxification support!");
    }
    if(supplements_lower.includes('milk thistle') || supplements_lower.includes('silymarin')){
      score += 5;
      bullets.push("🧬 GST null variant – milk thistle in product beneficial for liver support!");
    }
  }

  // === CARDIOVASCULAR ===
  if(genes.apoe_variant?.includes("E4")){
    if(supplements_lower.includes('dha') || supplements_lower.includes('curcumin')){
      score += 8;
      bullets.push("🧬 APOE4 variant – DHA/curcumin in product excellent for brain protection!");
    }
    if(supplements_lower.includes('saturated fat') || supplements_lower.includes('coconut oil')){
      score -= 8;
      bullets.push("⚠️ APOE4 variant – limit saturated fats, focus on omega-3s!");
    }
  }

  // === CAFFEINE METABOLISM ===
  if(genes.cyp1a2?.includes("AA")){
    if(supplements_lower.includes('caffeine')){
      score -= 8;
      bullets.push("⚠️ CYP1A2 slow metabolizer – caffeine in product may cause issues!");
    }
    if(supplements_lower.includes('theanine') || supplements_lower.includes('l-theanine')){
      score += 5;
      bullets.push("🧬 CYP1A2 slow variant – L-theanine in product beneficial for relaxation!");
    }
  }

  // === STATIN INTERACTIONS ===
  if(genes.slco1b1?.includes("CC")){
    if(supplements_lower.includes('coq10') || supplements_lower.includes('ubiquinol')){
      score += 8;
      bullets.push("🧬 SLCO1B1 variant – CoQ10 in product essential if taking statins!");
    }
  }

  // clamp
  score = Math.min(100, Math.max(0, score));
  if(bullets.length===0) bullets.push("No direct conflicts detected.");
  return { score, bullets };
} 
