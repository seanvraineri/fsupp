// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

// --- Inlined data & helpers ( avoids cross-file imports ) ----
export const geneReferences = [
  // === METHYLATION PATHWAY ===
  {
    gene: 'MTHFR',
    rsids: ['rs1801133', 'rs1801131'],
    genotypesOfConcern: ['CT', 'TT', 'AC', 'CC'],
    impact: 'Reduced conversion of folate to 5-MTHF leading to elevated homocysteine',
    supplement: 'L-Methylfolate',
    dosage: '400–1000 µg daily',
    evidence: 'high',
    cautions: 'Avoid >800 µg folic acid as it can mask B-12 deficiency',
  },
  {
    gene: 'MTR',
    rsids: ['rs1805087'],
    genotypesOfConcern: ['AG', 'GG'],
    impact: 'Impaired methionine synthase activity affecting B12 utilization',
    supplement: 'Methyl-B12',
    dosage: '1-5 mg sublingual daily',
    evidence: 'moderate',
    cautions: 'Monitor B12 levels; PPIs reduce absorption',
  },
  {
    gene: 'MTRR',
    rsids: ['rs1801394'],
    genotypesOfConcern: ['AG', 'GG'],
    impact: 'Reduced methionine synthase reductase activity',
    supplement: 'Methyl-B12; Betaine (TMG)',
    dosage: '1-5 mg B12, 500-1000 mg TMG daily',
    evidence: 'moderate',
    cautions: 'Support methylation cycle',
  },
  {
    gene: 'COMT',
    rsids: ['rs4680'],
    genotypesOfConcern: ['AA'],
    impact: 'Slow COMT activity; accumulation of dopamine and norepinephrine',
    supplement: 'Magnesium; SAMe',
    dosage: '400-600 mg Mg, 200-400 mg SAMe daily',
    evidence: 'moderate',
    cautions: 'Avoid high-dose methyl donors if overmethylation symptoms',
  },
  {
    gene: 'COMT',
    rsids: ['rs4680'],
    genotypesOfConcern: ['GG'],
    impact: 'Fast COMT activity; rapid dopamine breakdown',
    supplement: 'L-Tyrosine; Green Tea Extract',
    dosage: '500-1000 mg L-Tyrosine, 300-400 mg EGCG daily',
    evidence: 'moderate',
    cautions: 'Support dopamine production',
  },
  {
    gene: 'AHCY',
    rsids: ['rs819147'],
    genotypesOfConcern: ['TT'],
    impact: 'Reduced S-adenosylhomocysteine hydrolase activity',
    supplement: 'Glycine; Betaine (TMG)',
    dosage: '1-3g Glycine, 500-1000 mg TMG daily',
    evidence: 'low',
    cautions: 'Support homocysteine clearance',
  },
  {
    gene: 'CBS',
    rsids: ['rs234706'],
    genotypesOfConcern: ['GG'],
    impact: 'Upregulated transsulfuration pathway',
    supplement: 'Molybdenum; Vitamin B6',
    dosage: '150-300 µg Mo, 25-50 mg B6 daily',
    evidence: 'low',
    cautions: 'Avoid high-sulfur supplements if sensitive',
  },
  
  // === VITAMIN D PATHWAY ===
  {
    gene: 'VDR',
    rsids: ['rs2228570', 'rs1544410'],
    genotypesOfConcern: ['CC', 'AA'],
    impact: 'Reduced vitamin D receptor activity',
    supplement: 'Vitamin D3 + K2',
    dosage: '2000–5000 IU D3, 100-200 µg K2 daily',
    evidence: 'moderate',
    cautions: 'Monitor 25(OH)D levels; glucocorticoids reduce receptor activity',
  },
  {
    gene: 'CYP2R1',
    rsids: ['rs10741657'],
    genotypesOfConcern: ['AA'],
    impact: 'Reduced 25-hydroxylase activity; lower vitamin D activation',
    supplement: 'Vitamin D3',
    dosage: '3000-5000 IU daily',
    evidence: 'moderate',
    cautions: 'May need higher doses to achieve optimal levels',
  },
  {
    gene: 'CYP27B1',
    rsids: ['rs10877012'],
    genotypesOfConcern: ['TT'],
    impact: 'Reduced 1α-hydroxylase activity',
    supplement: 'Calcitriol (active D3)',
    dosage: 'Consult physician for dosing',
    evidence: 'low',
    cautions: 'May need active form of vitamin D',
  },
  {
    gene: 'CYP24A1',
    rsids: ['rs6013897'],
    genotypesOfConcern: ['TT'],
    impact: 'Slow vitamin D degradation; risk of toxicity',
    supplement: 'Lower dose Vitamin D3',
    dosage: '1000-2000 IU daily',
    evidence: 'low',
    cautions: 'Monitor vitamin D levels closely; risk of hypercalcemia',
  },

  // === B-VITAMIN METABOLISM ===
  {
    gene: 'FUT2',
    rsids: ['rs601338'],
    genotypesOfConcern: ['AA'],
    impact: 'Non-secretor status; reduced B12 absorption',
    supplement: 'Methyl-B12 (sublingual)',
    dosage: '1-5 mg sublingual daily',
    evidence: 'moderate',
    cautions: 'Bypass gut absorption issues',
  },
  {
    gene: 'TCN2',
    rsids: ['rs1801198'],
    genotypesOfConcern: ['GG'],
    impact: 'Reduced transcobalamin II function; B12 transport issues',
    supplement: 'High-dose B12 (methylcobalamin)',
    dosage: '5-10 mg daily',
    evidence: 'moderate',
    cautions: 'May need higher doses for transport',
  },

  // === OMEGA-3 METABOLISM ===
  {
    gene: 'FADS1',
    rsids: ['rs174550'],
    genotypesOfConcern: ['GG'],
    impact: 'Reduced delta-6-desaturase; poor omega-3 conversion',
    supplement: 'EPA/DHA (preformed)',
    dosage: '1-2g EPA+DHA daily',
    evidence: 'high',
    cautions: 'Cannot efficiently convert ALA to EPA/DHA',
  },
  {
    gene: 'FADS2',
    rsids: ['rs174575'],
    genotypesOfConcern: ['GG'],
    impact: 'Reduced fatty acid desaturase activity',
    supplement: 'Fish Oil (EPA/DHA)',
    dosage: '1-2g EPA+DHA daily',
    evidence: 'high',
    cautions: 'Need preformed omega-3s',
  },

  // === ANTIOXIDANT PATHWAYS ===
  {
    gene: 'SOD2',
    rsids: ['rs4880'],
    genotypesOfConcern: ['AA'],
    impact: 'Reduced mitochondrial superoxide dismutase activity',
    supplement: 'Manganese; CoQ10; PQQ',
    dosage: '5-10 mg Mn, 100-200 mg CoQ10, 10-20 mg PQQ daily',
    evidence: 'moderate',
    cautions: 'Support mitochondrial antioxidant defense',
  },
  {
    gene: 'GPX1',
    rsids: ['rs1050450'],
    genotypesOfConcern: ['TT'],
    impact: 'Reduced glutathione peroxidase activity',
    supplement: 'Selenium; NAC; Glutathione',
    dosage: '200 µg Se, 600 mg NAC, 250 mg Glutathione daily',
    evidence: 'moderate',
    cautions: 'Support glutathione system',
  },
  {
    gene: 'GSTM1',
    rsids: ['rs366631'],
    genotypesOfConcern: ['null'],
    impact: 'Absent glutathione S-transferase M1; reduced detoxification',
    supplement: 'NAC; Milk Thistle; Cruciferous Extract',
    dosage: '600 mg NAC, 150 mg Silymarin, 200 mg DIM daily',
    evidence: 'moderate',
    cautions: 'Support phase II detoxification',
  },
  {
    gene: 'GSTT1',
    rsids: ['rs17856199'],
    genotypesOfConcern: ['null'],
    impact: 'Absent glutathione S-transferase T1',
    supplement: 'NAC; Alpha-Lipoic Acid',
    dosage: '600 mg NAC, 300 mg ALA daily',
    evidence: 'moderate',
    cautions: 'Support glutathione synthesis',
  },

  // === CARDIOVASCULAR & LIPID METABOLISM ===
  {
    gene: 'APOE',
    rsids: ['rs429358', 'rs7412'],
    genotypesOfConcern: ['ε3/ε4', 'ε4/ε4'],
    impact: "Higher LDL-C & increased Alzheimer's risk",
    supplement: 'DHA-rich fish oil; Curcumin',
    dosage: 'EPA+DHA ≥ 1g, 500-1000 mg Curcumin daily',
    evidence: 'high',
    cautions: 'High saturated-fat diet worsens lipids in ε4 carriers',
  },
  {
    gene: 'LPA',
    rsids: ['rs3798220'],
    genotypesOfConcern: ['CC'],
    impact: 'Elevated lipoprotein(a); increased cardiovascular risk',
    supplement: 'Niacin; Omega-3; CoQ10',
    dosage: '500-1000 mg Niacin, 2g Omega-3, 100 mg CoQ10 daily',
    evidence: 'moderate',
    cautions: 'Monitor liver function with niacin',
  },
  {
    gene: 'ACE',
    rsids: ['rs4340'],
    genotypesOfConcern: ['DD'],
    impact: 'Higher ACE activity; increased cardiovascular risk',
    supplement: 'Magnesium; Potassium; Hawthorn',
    dosage: '400 mg Mg, 99 mg K, 300 mg Hawthorn daily',
    evidence: 'moderate',
    cautions: 'Support cardiovascular health',
  },

  // === IRON METABOLISM ===
  {
    gene: 'HFE',
    rsids: ['rs1799945', 'rs1800562'],
    genotypesOfConcern: ['CC', 'AA'],
    impact: 'Hemochromatosis variants; iron overload risk',
    supplement: 'Avoid iron; Use Lactoferrin',
    dosage: 'NO iron supplements; 200-400 mg Lactoferrin if needed',
    evidence: 'high',
    cautions: 'NEVER supplement iron; monitor ferritin levels',
  },
  {
    gene: 'TMPRSS6',
    rsids: ['rs855791'],
    genotypesOfConcern: ['GG'],
    impact: 'Increased hepcidin; reduced iron absorption',
    supplement: 'Iron (with Vitamin C)',
    dosage: '18-25 mg Iron with 500 mg Vitamin C daily',
    evidence: 'moderate',
    cautions: 'Take with vitamin C for better absorption',
  },

  // === CAFFEINE & STIMULANT METABOLISM ===
  {
    gene: 'CYP1A2',
    rsids: ['rs762551'],
    genotypesOfConcern: ['AA'],
    impact: 'Slow caffeine metabolism; increased sensitivity',
    supplement: 'L-Theanine; Magnesium',
    dosage: '200 mg L-Theanine, 400 mg Mg daily',
    evidence: 'moderate',
    cautions: 'Limit caffeine; support relaxation',
  },

  // === OTHER IMPORTANT VARIANTS ===
  {
    gene: 'ALDH2',
    rsids: ['rs671'],
    genotypesOfConcern: ['AG', 'AA'],
    impact: 'Reduced aldehyde dehydrogenase; alcohol sensitivity',
    supplement: 'NAD+; Milk Thistle; B-Complex',
    dosage: '100 mg NAD+, 150 mg Silymarin, B-Complex daily',
    evidence: 'low',
    cautions: 'Support liver detoxification',
  },
  {
    gene: 'SLCO1B1',
    rsids: ['rs4149056'],
    genotypesOfConcern: ['CC'],
    impact: 'Reduced statin transport; increased myopathy risk',
    supplement: 'CoQ10; Red Yeast Rice (if not on statins)',
    dosage: '100-200 mg CoQ10 daily',
    evidence: 'moderate',
    cautions: 'Essential if taking statins; avoid RYR with statins',
  },
  {
    gene: 'APOC3',
    rsids: ['rs2854116'],
    genotypesOfConcern: ['CC'],
    impact: 'Increased triglycerides',
    supplement: 'Omega-3 (high EPA); Berberine',
    dosage: '2-3g EPA, 500 mg Berberine twice daily',
    evidence: 'high',
    cautions: 'Focus on triglyceride reduction',
  },
  {
    gene: 'CETP',
    rsids: ['rs708272'],
    genotypesOfConcern: ['GG'],
    impact: 'Increased cholesteryl ester transfer protein activity',
    supplement: 'Niacin; Plant Sterols',
    dosage: '500 mg Niacin, 2g Plant Sterols daily',
    evidence: 'moderate',
    cautions: 'Support HDL cholesterol',
  }
];

export const allergyConflicts = {
  shellfish: ['Glucosamine', 'Chondroitin', 'Chitosan', 'Marine Collagen', 'Krill Oil'],
  fish: ['Fish Oil', 'Cod Liver Oil'],
  soy: ['Soy Lecithin', 'Soy Isoflavones', 'Soy Protein'],
  ragweed: ['Chamomile', 'Echinacea', 'Dandelion', 'Milk Thistle', 'Artichoke'],
  latex: ['Avocado Powder', 'Banana Powder', 'Kiwi Powder', 'Papaya Powder', 'Mango Powder', 'Passionfruit Powder', 'Fig Powder', 'Melon Powder', 'Tomato Powder'],
  bee: ['Bee Pollen', 'Propolis', 'Royal Jelly'],
};

export const drugConflicts = {
  warfarin: ["Vitamin K", "St John's Wort", 'Ginkgo', 'Garlic', 'Fish Oil', 'Cranberry', 'Dong Quai', 'Feverfew'],
  anticoagulant: ['Fish Oil', 'Ginkgo'],
  ssri: ["St John's Wort", '5-HTP', 'Tryptophan', 'SAMe', 'Ginseng'],
  snri: ["St John's Wort", '5-HTP', 'SAMe'],
  maoi: ["St John's Wort", 'Ginseng', 'Tyramine'],
  benzo: ['Kava', 'Valerian', 'Melatonin', 'CBD'],
  opioid: ['Kava', 'Valerian'],
  levothyroxine: ['Calcium', 'Iron', 'Magnesium', 'Zinc', 'Soy Isoflavones'],
  statin: ['Red Yeast Rice', 'Grapefruit Extract'],
  insulin: ['Cinnamon', 'Chromium', 'Alpha-Lipoic Acid', 'Berberine', 'Fenugreek', 'Bitter Melon'],
  diuretic: ['Potassium', 'Magnesium', 'Licorice'],
  ace: ['Potassium'],
  arb: ['Potassium'],
  cyclosporine: ["St John's Wort", 'Echinacea', 'Astragalus'],
  tki: ["St John's Wort"],
};

// Enhanced gene-gene interaction matrix
const geneInteractions = {
  // MTHFR + CBS can cause issues if both impaired
  'MTHFR+CBS': {
    genes: ['MTHFR', 'CBS'],
    concern: 'Both impaired methylation and upregulated transsulfuration can lead to folate depletion',
    recommendation: 'Lower dose methylfolate (200-400 µg), avoid high-sulfur supplements',
    caution: 'Monitor homocysteine levels closely'
  },
  // COMT slow + MTHFR can cause overmethylation
  'COMT+MTHFR': {
    genes: ['COMT', 'MTHFR'],
    concern: 'Slow COMT with MTHFR variants can lead to overmethylation symptoms',
    recommendation: 'Start with very low dose methyl donors, focus on cofactors like B6, Mg',
    caution: 'Watch for anxiety, insomnia, irritability from overmethylation'
  },
  // HFE + Iron supplements = dangerous
  'HFE+Iron': {
    genes: ['HFE'],
    supplements: ['Iron'],
    concern: 'Iron overload risk with hemochromatosis variants',
    recommendation: 'NEVER supplement iron, use lactoferrin if needed',
    caution: 'Monitor ferritin levels regularly'
  },
  // APOE4 + high saturated fat
  'APOE4+SatFat': {
    genes: ['APOE'],
    concern: 'APOE4 carriers have increased cardiovascular risk with high saturated fat',
    recommendation: 'Emphasize omega-3s, avoid coconut oil, limit saturated fats',
    caution: 'Mediterranean diet pattern recommended'
  }
};

// Enhanced medical condition interactions
const medicalConditionInteractions = {
  diabetes: {
    avoid: ['High-dose Chromium', 'Bitter Melon', 'Cinnamon Extract'],
    caution: 'Blood sugar monitoring supplements can interact with medications',
    consider: ['Alpha-Lipoic Acid (with monitoring)', 'Magnesium', 'Omega-3']
  },
  thyroid_disease: {
    avoid: ['Kelp', 'Iodine (unless deficient)', 'Soy Isoflavones'],
    timing: 'Take calcium, iron, magnesium 4+ hours from thyroid medication',
    consider: ['Selenium', 'Zinc', 'Vitamin D']
  },
  kidney_disease: {
    avoid: ['High-dose Magnesium', 'Potassium', 'High-dose Vitamin C'],
    caution: 'Many supplements require kidney clearance',
    consider: ['Lower doses under medical supervision']
  },
  liver_disease: {
    avoid: ['Kava', 'High-dose Niacin', 'Iron (unless deficient)'],
    caution: 'Hepatic metabolism affects many supplements',
    consider: ['Milk Thistle', 'NAC', 'B-Complex (lower doses)']
  },
  cardiovascular_disease: {
    avoid: ['Ephedra', 'High-dose Iron', 'Licorice'],
    consider: ['Omega-3', 'CoQ10', 'Magnesium', 'Hawthorn'],
    caution: 'Monitor blood pressure with all supplements'
  }
};

// Base recommendations based on common health concerns
const baseRecommendations = {
  general: [
    {
      supplement_name: "Vitamin D3",
      dosage_amount: 2000,
      dosage_unit: "IU",
      frequency: "daily",
      reason: "Supports immune function, bone health, and mood regulation",
      evidence: "high"
    },
    {
      supplement_name: "Magnesium Glycinate",
      dosage_amount: 400,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Supports muscle function, sleep quality, and stress response",
      evidence: "high"
    },
    {
      supplement_name: "Omega-3 (EPA/DHA)",
      dosage_amount: 1000,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Supports heart health, brain function, and reduces inflammation",
      evidence: "high"
    }
  ],
  fatigue: [
    {
      supplement_name: "Vitamin B Complex",
      dosage_amount: 1,
      dosage_unit: "capsule",
      frequency: "daily",
      reason: "Supports energy metabolism and nervous system function",
      evidence: "moderate"
    },
    {
      supplement_name: "CoQ10",
      dosage_amount: 100,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Supports cellular energy production and mitochondrial function",
      evidence: "moderate"
    },
    {
      supplement_name: "Iron",
      dosage_amount: 18,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Essential for oxygen transport and energy production (check levels first)",
      evidence: "high",
      cautions: "Only if deficient - excess iron can be harmful"
    }
  ],
  stress: [
    {
      supplement_name: "Ashwagandha",
      dosage_amount: 600,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Adaptogen that helps manage stress and cortisol levels",
      evidence: "moderate"
    },
    {
      supplement_name: "L-Theanine",
      dosage_amount: 200,
      dosage_unit: "mg",
      frequency: "as needed",
      reason: "Promotes relaxation without drowsiness",
      evidence: "moderate"
    }
  ],
  sleep: [
    {
      supplement_name: "Melatonin",
      dosage_amount: 3,
      dosage_unit: "mg",
      frequency: "nightly",
      reason: "Helps regulate sleep-wake cycle",
      evidence: "high",
      cautions: "Start with lower dose (1mg) and increase if needed"
    },
    {
      supplement_name: "Magnesium Glycinate",
      dosage_amount: 400,
      dosage_unit: "mg",
      frequency: "evening",
      reason: "Promotes muscle relaxation and better sleep quality",
      evidence: "moderate"
    }
  ],
  digestion: [
    {
      supplement_name: "Probiotic (Multi-strain)",
      dosage_amount: 10,
      dosage_unit: "billion CFU",
      frequency: "daily",
      reason: "Supports digestive health and immune function",
      evidence: "moderate"
    },
    {
      supplement_name: "Digestive Enzymes",
      dosage_amount: 1,
      dosage_unit: "capsule",
      frequency: "with meals",
      reason: "Supports optimal digestion and nutrient absorption",
      evidence: "moderate"
    }
  ]
};

interface AnalysisRequest { user_id: string; }

serve(async (req) => {
  console.log("generate_analysis function invoked");
  
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    
    let body: AnalysisRequest;
    try { 
      body = await req.json(); 
      console.log("Request body:", body);
    } catch (_) { 
      return new Response('Invalid JSON', { status: 400 }); 
    }
    
    const { user_id } = body;
    if (!user_id) return new Response('Missing user_id', { status: 400 });

    // Check environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? Deno.env.get('CLAUDE_API_KEY');
    
    console.log("Environment check:", { 
      SUPABASE_URL: !!SUPABASE_URL, 
      SERVICE_ROLE_KEY: !!SERVICE_ROLE_KEY, 
      OPENAI_API_KEY: !!OPENAI_API_KEY,
      ANTHROPIC_API_KEY: !!ANTHROPIC_API_KEY
    });
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return new Response('Configuration error', { status: 500 });
    }

    console.log("Creating Supabase client");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log("Fetching assessment for user:", user_id);
    const { data: assessment, error: assessErr } = await supabase
      .from('health_assessments')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_complete', true)
      .order('created_at',{ascending:false})
      .limit(1)
      .maybeSingle();
      
    if (assessErr) {
      console.error('Error fetching assessment:', assessErr);
      console.error('Assessment error details:', JSON.stringify(assessErr, null, 2));
      return new Response('Database error', { status: 500 });
    }
    
    if (!assessment) {
      console.log("No completed assessment found for user:", user_id);
      return new Response('No completed assessment', { status: 404 });
    }
    
    console.log("Assessment found, ID:", assessment.id);

    console.log("Fetching genetic markers and lab biomarkers");
    const { data: markers, error: markersErr } = await supabase.from('genetic_markers').select('*').eq('user_id', user_id);
    const { data: labs, error: labsErr } = await supabase.from('lab_biomarkers').select('*').eq('user_id', user_id);
    
    if (markersErr) console.error("Error fetching genetic markers:", markersErr);
    if (labsErr) console.error("Error fetching lab biomarkers:", labsErr);
    
    console.log(`Found ${markers?.length || 0} genetic markers, ${labs?.length || 0} lab biomarkers`);

    // Prepare base analysis
    let analysis_summary = "Based on your health profile, here are personalized supplement recommendations to support your wellness goals.";
    let interaction_warnings: string[] = [];
    let supplements = [...baseRecommendations.general];
    let relevant_genes: any[] = [];
    let relevant_biomarkers: any[] = [];

    // Add condition-specific recommendations
    const healthConcerns = assessment.health_concerns || [];
    if (healthConcerns.includes('fatigue') || healthConcerns.includes('low_energy')) {
      supplements.push(...baseRecommendations.fatigue);
      analysis_summary += " Focus areas include energy support.";
    }
    if (healthConcerns.includes('stress') || healthConcerns.includes('anxiety')) {
      supplements.push(...baseRecommendations.stress);
      analysis_summary += " Stress management support included.";
    }
    if (healthConcerns.includes('sleep_issues') || healthConcerns.includes('insomnia')) {
      supplements.push(...baseRecommendations.sleep);
      analysis_summary += " Sleep quality optimization addressed.";
    }
    if (healthConcerns.includes('digestive_issues') || healthConcerns.includes('bloating')) {
      supplements.push(...baseRecommendations.digestion);
      analysis_summary += " Digestive health support included.";
    }

    // Add genetic-based recommendations if available
    if (markers && markers.length > 0) {
      const userGenes = new Set(markers.map(m => m.rsid));
      const geneVariants = new Map(markers.map(m => [m.rsid, m.genotype]));
      
      // Check for gene-gene interactions first
      const detectedInteractions = [];
      for (const [key, interaction] of Object.entries(geneInteractions)) {
        const hasAllGenes = interaction.genes.every(gene => {
          return geneReferences.some(ref => 
            ref.gene === gene && 
            ref.rsids.some(rsid => userGenes.has(rsid))
          );
        });
        
        if (hasAllGenes) {
          detectedInteractions.push(interaction);
          interaction_warnings.push(`Gene interaction detected: ${interaction.concern}. ${interaction.caution}`);
        }
      }
      
      for (const marker of markers) {
        const geneRef = geneReferences.find(ref => ref.rsids.includes(marker.rsid));
        if (geneRef && geneRef.genotypesOfConcern?.includes(marker.genotype)) {
          // Check if we already have this supplement
          const existingSupp = supplements.find(s => s.supplement_name.toLowerCase().includes(geneRef.supplement.toLowerCase()));
          if (!existingSupp) {
            // Check for gene-specific contraindications
            const shouldAvoid = detectedInteractions.some(interaction => 
              interaction.genes.includes(geneRef.gene) && 
              interaction.supplements && 
              interaction.supplements.some(supp => geneRef.supplement.includes(supp))
            );
            
            if (!shouldAvoid) {
              const [amount, unit] = geneRef.dosage.match(/(\d+(?:\.\d+)?)\s*(.+)/) || [0, 'mg'];
              supplements.push({
                supplement_name: geneRef.supplement.split(';')[0].trim(),
                dosage_amount: parseFloat(amount) || 1000,
                dosage_unit: unit || 'mg',
                frequency: 'daily',
                reason: `Genetic variation in ${geneRef.gene} - ${geneRef.impact}`,
                evidence: geneRef.evidence,
                cautions: geneRef.cautions
              });
            }
          }
          analysis_summary += ` Genetic analysis shows ${geneRef.gene} variation.`;
          relevant_genes.push(geneRef.gene);
          relevant_biomarkers.push(geneRef.rsids.join(', '));
        }
      }
    }
    
    // Check medical condition interactions
    const medicalConditions = new Set((assessment.medical_conditions ?? []).map((c: string) => c.toLowerCase()));
    for (const [condition, rules] of Object.entries(medicalConditionInteractions)) {
      if (medicalConditions.has(condition)) {
        // Remove contraindicated supplements
        supplements = supplements.filter(s => {
          const shouldAvoid = rules.avoid.some(avoid => 
            s.supplement_name.toLowerCase().includes(avoid.toLowerCase())
          );
          if (shouldAvoid) {
            interaction_warnings.push(`Avoiding ${s.supplement_name} due to ${condition}: ${rules.caution}`);
            return false;
          }
          return true;
        });
        
        // Add condition-specific recommendations
        if (rules.consider) {
          for (const consideredSupplement of rules.consider) {
            const exists = supplements.find(s => 
              s.supplement_name.toLowerCase().includes(consideredSupplement.toLowerCase())
            );
            if (!exists) {
              supplements.push({
                supplement_name: consideredSupplement,
                dosage_amount: 500,
                dosage_unit: 'mg',
                frequency: 'daily',
                reason: `Recommended for ${condition}`,
                evidence: 'moderate',
                cautions: rules.caution
              });
            }
          }
        }
      }
    }

    // If we have AI API keys, try to use them for better analysis with comprehensive context
    let aiAnalysisSuccessful = false;
    
    if (ANTHROPIC_API_KEY) {
      try {
        console.log("Using Anthropic Claude for comprehensive analysis");
        
        // Create comprehensive user context for AI
        const userContext = {
          demographics: {
            age: assessment.age,
            sex: assessment.sex,
            height: assessment.height,
            weight: assessment.weight
          },
          health_goals: assessment.health_goals || [],
          primary_concerns: assessment.health_concerns || [],
          lifestyle: {
            activity_level: assessment.activity_level,
            stress_level: assessment.stress_level,
            sleep_hours: assessment.sleep_hours,
            diet_type: assessment.diet_type
          },
          medical_history: {
            conditions: assessment.medical_conditions || [],
            medications: assessment.current_medications || [],
            allergies: assessment.allergies || [],
            family_history: assessment.family_history || []
          },
          genetic_profile: markers || [],
          lab_results: labs || [],
          supplement_preferences: {
            budget_range: assessment.supplement_budget,
            form_preferences: assessment.supplement_forms,
            timing_preferences: assessment.preferred_timing
          }
        };
        
        const enhancedSystemPrompt = `You are SupplementScribe, an advanced precision medicine AI specializing in personalized supplement recommendations. You have access to comprehensive user health data including genetics, labs, medical history, and specific health goals.

CRITICAL SAFETY REQUIREMENTS:
1. Always check for drug-supplement interactions based on current medications
2. Avoid supplements contraindicated by medical conditions
3. Consider genetic variants that affect supplement metabolism and safety
4. Never recommend iron to users with HFE variants (hemochromatosis risk)
5. Be cautious with methylation supplements in COMT/MTHFR combinations
6. Respect allergy restrictions absolutely

PERSONALIZATION PRIORITIES:
1. Address the user's specific health goals as the PRIMARY focus
2. Consider their lifestyle, activity level, and dietary patterns
3. Factor in their supplement budget and form preferences
4. Tailor dosages based on genetic variants when relevant
5. Provide realistic timelines for expected benefits

HEALTH GOALS INTEGRATION:
- If weight loss is a goal: emphasize metabolic support, blood sugar balance
- If energy is a goal: focus on mitochondrial support, B-vitamins, adaptogens
- If stress management: prioritize magnesium, adaptogens, calming herbs
- If athletic performance: emphasize recovery, anti-inflammatory, electrolytes
- If cognitive health: focus on omega-3s, antioxidants, neuroprotectants
- If longevity: emphasize cellular health, NAD+, antioxidants

You MUST return valid JSON only with this exact format:
{
  "analysis_summary": "Comprehensive analysis addressing user's specific health goals and genetic profile",
  "interaction_warnings": ["Specific safety warnings"],
  "health_goal_focus": "Primary health goals being addressed",
  "supplements": [
    {
      "supplement_name": "string",
      "dosage_amount": number,
      "dosage_unit": "string", 
      "frequency": "string",
      "reason": "string explaining how this addresses their specific goals",
      "evidence": "high"|"moderate"|"low",
      "cautions": "string|null",
      "timeline": "Expected timeframe for benefits",
      "priority": "high"|"medium"|"low"
    }
  ],
  "relevant_genes": ["MTR", "APOE"],
  "relevant_biomarkers": ["LDL-C", "Homocysteine"]
}`;

        const aiResp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 2048,
            temperature: 0.2,
            system: enhancedSystemPrompt,
            messages: [{
              role: "user",
              content: `Please analyze this user's complete health profile and create personalized supplement recommendations that specifically address their health goals and genetic profile:

USER PROFILE: ${JSON.stringify(userContext, null, 2)}

GENETIC REFERENCES: ${JSON.stringify(geneReferences, null, 2)}

SAFETY DATA: 
- Drug Interactions: ${JSON.stringify(drugConflicts, null, 2)}
- Allergy Conflicts: ${JSON.stringify(allergyConflicts, null, 2)}
- Medical Condition Interactions: ${JSON.stringify(medicalConditionInteractions, null, 2)}

Focus particularly on their health goals: ${assessment.health_goals?.join(', ') || 'general wellness'}`
            }]
          }),
        });

        if (aiResp.ok) {
          const aiJson = await aiResp.json();
          const aiContent = aiJson.content[0].text;
          
          // Try to extract JSON from the response
          let jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            analysis_summary = result.analysis_summary;
            interaction_warnings = result.interaction_warnings || [];
            supplements = result.supplements;
            relevant_genes = result.relevant_genes || [];
            relevant_biomarkers = result.relevant_biomarkers || [];
            aiAnalysisSuccessful = true;
            console.log("Enhanced Claude analysis successful with health goals integration");
          }
        }
      } catch (err) {
        console.error('Claude API error:', err);
      }
    }
    
    if (!aiAnalysisSuccessful && OPENAI_API_KEY) {
      try {
        console.log("Using OpenAI for comprehensive analysis");
        
        const userContext = {
          demographics: { age: assessment.age, sex: assessment.sex },
          health_goals: assessment.health_goals || [],
          primary_concerns: assessment.health_concerns || [],
          lifestyle: { activity_level: assessment.activity_level, stress_level: assessment.stress_level },
          medical_history: { 
            conditions: assessment.medical_conditions || [],
            medications: assessment.current_medications || [],
            allergies: assessment.allergies || []
          },
          genetic_profile: markers || [],
          lab_results: labs || []
        };
        
        // Import OpenAI dynamically
        const OpenAI = (await import("npm:openai@4.18.0")).default;
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
        
        const completion = await openai.chat.completions.create({ 
          model: 'gpt-3.5-turbo-0125', 
          messages: [
            {
              role:'system',
              content:`You are SupplementScribe, a precision medicine AI. Create personalized supplement recommendations focusing on the user's specific health goals, genetic profile, and safety considerations. Always prioritize their stated health goals and consider drug interactions, allergies, and medical conditions. Return ONLY valid JSON with format: {"analysis_summary": string, "interaction_warnings": string[], "health_goal_focus": string, "supplements": [{"supplement_name": string, "dosage_amount": number, "dosage_unit": string, "frequency": string, "reason": string, "evidence": "high"|"moderate"|"low", "cautions": string|null, "priority": "high"|"medium"|"low"}]}`
            },
            {
              role:'user',
              content: `Analyze this user's health profile and create recommendations focused on their health goals:

USER CONTEXT: ${JSON.stringify(userContext, null, 2)}

GENETIC REFERENCES: ${JSON.stringify(geneReferences.slice(0, 10), null, 2)}

SAFETY CONSIDERATIONS:
- Drug Interactions: ${JSON.stringify(drugConflicts, null, 2)}
- Allergy Conflicts: ${JSON.stringify(allergyConflicts, null, 2)}

PRIMARY HEALTH GOALS: ${assessment.health_goals?.join(', ') || 'general wellness'}

Focus your recommendations on achieving these specific health goals while ensuring safety.`
            }
          ], 
          max_tokens: 1500,
          temperature: 0.2,
          response_format: { type: "json_object" }
        });
        
        const result = JSON.parse(completion.choices[0].message.content ?? '{}');
        analysis_summary = result.analysis_summary;
        interaction_warnings = result.interaction_warnings || [];
        supplements = result.supplements;
        relevant_genes = result.relevant_genes || [];
        relevant_biomarkers = result.relevant_biomarkers || [];
        aiAnalysisSuccessful = true;
        console.log("Enhanced OpenAI analysis successful with health goals integration");
      } catch (err) { 
        console.error('OpenAI error:', err);
      }
    }

    // Process allergies and drug interactions
    const allergies = new Set((assessment.allergies ?? []).map((a: string)=>a.toLowerCase()));
    const meds = new Set((assessment.current_medications ?? []).map((m: string)=>m.toLowerCase()));

    console.log(`Processing ${supplements.length} supplements for filtering`);
    supplements = supplements.filter((s)=>{
      const lower = s.supplement_name.toLowerCase();
      for (const [allergy,bad] of Object.entries(allergyConflicts)) {
        if (allergies.has(allergy) && bad.some((b)=>b.toLowerCase()===lower)) { 
          interaction_warnings.push(`Avoid ${s.supplement_name} due to ${allergy} allergy.`); 
          return false; 
        }
      }
      for (const [drug,bad] of Object.entries(drugConflicts)) {
        if ([...meds].some((m)=>m.includes(drug)) && bad.some((b)=>b.toLowerCase()===lower)) { 
          interaction_warnings.push(`${s.supplement_name} may interact with ${drug}.`); 
          return false; 
        }
      }
      return true;
    });

    // Remove duplicates
    const uniqueSupplements = supplements.reduce((acc: any[], curr) => {
      const exists = acc.find(s => s.supplement_name.toLowerCase() === curr.supplement_name.toLowerCase());
      if (!exists) {
        acc.push(curr);
      }
      return acc;
    }, []);

    console.log(`Filtered to ${uniqueSupplements.length} unique supplements`);
    console.log("Inserting AI analysis record");
    
    const analysisData = { 
      user_id, 
      assessment_id: assessment.id, 
      model_name: aiAnalysisSuccessful ? (ANTHROPIC_API_KEY ? 'claude-3-haiku' : 'gpt-3.5-turbo') : 'rule-based', 
      analysis_summary, 
      interaction_warnings: interaction_warnings || [],
      overall_confidence: aiAnalysisSuccessful ? 0.9 : 0.6,
      relevant_genes: relevant_genes || [],
      relevant_biomarkers: relevant_biomarkers || []
    };
    
    console.log("Analysis data:", JSON.stringify(analysisData, null, 2));
    
    const { data: analysisRow, error: analysisInsertErr } = await supabase
      .from('ai_analyses')
      .insert(analysisData)
      .select()
      .single();
      
    if (analysisInsertErr) {
      console.error("Error inserting analysis:", analysisInsertErr);
      console.error("Analysis insert error details:", JSON.stringify(analysisInsertErr, null, 2));
      return new Response('Database error: ' + analysisInsertErr.message, { status: 500 });
    }
    
    console.log("Analysis inserted, ID:", analysisRow?.id);

    // 🔄  Vector memory: store the analysis summary
    try {
      await supabase.functions.invoke('embedding_worker', {
        body: {
          items: [{
            user_id,
            source_type: 'plan',
            source_id: analysisRow.id,
            content: analysis_summary.slice(0, 15000)
          }]
        }
      });
    } catch (embedErr) {
      console.error('embedding_worker error', embedErr);
    }

    if (Array.isArray(uniqueSupplements) && analysisRow) {
      const rows = uniqueSupplements.map((s)=>({ 
        user_id, 
        analysis_id: analysisRow.id, 
        supplement_name:s.supplement_name, 
        dosage_amount:s.dosage_amount, 
        dosage_unit:s.dosage_unit, 
        frequency:s.frequency, 
        priority_score: s.priority === 'high' ? 5 : s.priority === 'medium' ? 3 : s.priority === 'low' ? 2 : (s.evidence === 'high' ? 5 : s.evidence === 'moderate' ? 3 : 2), 
        recommendation_reason:s.reason, 
        expected_benefits: s.timeline ? [s.timeline] : [], 
        evidence_quality:s.evidence, 
        contraindications: s.cautions ? [s.cautions] : [],
        is_active:true 
      }));
      
      console.log(`Inserting ${rows.length} supplement recommendations`);
      const { error: recErr } = await supabase.from('supplement_recommendations').insert(rows);
      
      if (recErr) {
        console.error("Error inserting recommendations:", recErr);
        console.error("Recommendations error details:", JSON.stringify(recErr, null, 2));
      } else {
        // After inserting recommendations, populate product links
        console.log("Populating product links for recommendations");
        try {
          // Get the newly created recommendations
          const { data: newRecommendations } = await supabase
            .from('supplement_recommendations')
            .select('id, supplement_name')
            .eq('analysis_id', analysisRow.id);
            
          if (newRecommendations) {
            for (const rec of newRecommendations) {
              console.log(`Finding products for: ${rec.supplement_name}`);
              
              // Use the enhanced single supplement search
              const productSearchResponse = await supabase.functions.invoke('product_search', {
                body: { supplement_name: rec.supplement_name }
              });
              
              if (productSearchResponse.data?.success && productSearchResponse.data.product_url) {
                console.log(`Found product: ${productSearchResponse.data.brand} - ${productSearchResponse.data.product_url}`);
                
                // Create product link for this recommendation
                const productLink = {
                  recommendation_id: rec.id,
                  supplement_name: rec.supplement_name,
                  brand: productSearchResponse.data.brand,
                  product_name: productSearchResponse.data.product_name,
                  product_url: productSearchResponse.data.product_url,
                  price: productSearchResponse.data.price,
                  verified: true
                };
                
                await supabase.from('product_links').insert(productLink);
                console.log(`Created product link for ${rec.supplement_name}`);
              } else {
                console.log(`No products found for ${rec.supplement_name}, product search response:`, productSearchResponse);
                
                // Create a basic fallback link using the search URLs as backup
                const fallbackLink = {
                  recommendation_id: rec.id,
                  supplement_name: rec.supplement_name,
                  brand: "Multiple Options",
                  product_name: `${rec.supplement_name} - Find Best Price`,
                  product_url: `https://www.vitacost.com/search?t=${encodeURIComponent(rec.supplement_name)}`,
                  price: null,
                  verified: true
                };
                
                await supabase.from('product_links').insert(fallbackLink);
                console.log(`Created fallback product link for ${rec.supplement_name}`);
              }
            }
          }
        } catch (productError) {
          console.error("Error populating product links:", productError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      status:'ok', 
      mode: aiAnalysisSuccessful ? 'ai-enhanced' : 'rule-based',
      analysis_id: analysisRow?.id 
    }), { headers:{'Content-Type':'application/json'} });
  } catch (error) {
    console.error('generate_analysis error:', error);
    return new Response(JSON.stringify({ error: 'Internal error', details: String(error) }), { 
      status: 500, 
      headers:{'Content-Type':'application/json'} 
    });
  }
}); 
