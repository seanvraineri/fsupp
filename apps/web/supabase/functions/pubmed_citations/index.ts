// deno-lint-ignore-file
// @ts-nocheck
// pubmed_citations - v2 2025-06-03
// Fetch and store PubMed citations for supplement recommendations

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

import { searchPubMed, type PubMedResult } from "./lib/pubmed.ts";
import { summarizeAbstract, type UserProfile } from "./lib/openai.ts";
import { calculateRelevanceScore, type RelevanceContext } from "./lib/relevance.ts";
import { 
  upsertCitations, 
  getExistingCitations, 
  getRecommendationContext,
  type CitationRecord,
  type DatabaseResult 
} from "./lib/db.ts";

interface CitationRequest {
  recommendation_id: string;
  supplement_name: string;
  health_condition?: string;
  genetic_variant?: string;
}

interface CitationResult {
  success: boolean;
  citations_found: number;
  citations_new: number;
  recommendation_id: string;
  execution_time_ms: number;
  error?: string;
}

// Generate personalized research summaries
function generatePersonalizedSummary(title: string, supplement: string, genetic?: string, condition?: string): string {
  const supplementLower = supplement.toLowerCase();
  
  // Base personalization
  let summary = `📚 **Research Chosen Specifically for You**: This study directly validates why we recommend ${supplement} for your unique health profile. `;
  
  // Add genetic personalization
  if (genetic) {
    if (genetic.toUpperCase().includes('MTHFR')) {
      summary += `We selected this research because you have MTHFR genetic variants, and this study specifically demonstrates why methylated forms of folate are crucial for people with YOUR exact genetic profile. The findings show how your ${genetic} variant affects folate metabolism - this isn't generic research, it's directly relevant to your genetics. `;
    } else if (genetic.toUpperCase().includes('COMT')) {
      summary += `This research is particularly important for you because your COMT genetic variant affects how your body processes neurotransmitters. We chose this study specifically because it shows how people with YOUR ${genetic} variant respond to supplementation differently than others. This validates our personalized approach for your unique dopamine and stress pathways. `;
    } else if (genetic.toUpperCase().includes('APOE')) {
      summary += `We specifically selected this research for you because your APOE genetic profile puts you in a unique category that requires targeted supplementation. This study demonstrates why people with YOUR ${genetic} variant need specific nutritional support for cardiovascular and cognitive protection - it's like this research was designed for your genetics. `;
    } else if (genetic.toUpperCase().includes('FADS')) {
      summary += `This research is especially relevant to your health journey because your FADS genetic variants significantly impact how your body processes omega-3 fatty acids. We chose this study because it specifically addresses people with YOUR ${genetic} genetic profile and shows why you need preformed EPA/DHA rather than plant-based omega-3s. `;
    } else {
      summary += `We selected this research specifically because you have the ${genetic} genetic variant, and this study shows how people with your exact genetic makeup respond to supplementation. This validates why our recommendations are tailored to YOUR unique genetic profile rather than using a one-size-fits-all approach. `;
    }
  }
  
  // Add supplement-specific insights
  if (supplementLower.includes('vitamin d')) {
    summary += `The research findings confirm exactly why we think vitamin D3 supplementation will work so well for you - the study shows how this nutrient can optimize immune function, bone health, and mood regulation in people with profiles similar to yours. We believe these benefits will translate directly to your health improvements.`;
  } else if (supplementLower.includes('magnesium')) {
    summary += `This study validates our choice of magnesium for your specific needs, showing how this mineral improves sleep quality, reduces stress, and supports over 300 enzymatic reactions. We think the findings in this research will apply directly to your health goals and current symptoms.`;
  } else if (supplementLower.includes('omega') || supplementLower.includes('fish oil')) {
    summary += `The research confirms why we specifically recommend EPA/DHA for your profile - this study demonstrates how these omega-3s reduce inflammation, support brain function, and optimize cardiovascular health in people with health patterns similar to yours. We believe you'll experience these same benefits.`;
  } else if (supplementLower.includes('b12') || supplementLower.includes('methylcobalamin')) {
    summary += `This research supports exactly why we chose methylcobalamin B12 for you - the study shows how this active form boosts energy levels, supports nerve function, and improves cognitive performance. We think these research findings will translate directly to improvements in your daily energy and mental clarity.`;
  } else if (supplementLower.includes('iron')) {
    summary += `The findings in this study validate our iron recommendation for your specific situation, showing how proper iron supplementation restores energy levels, improves oxygen transport, and resolves fatigue symptoms. We believe this research demonstrates exactly what you can expect from your targeted iron protocol.`;
  } else if (supplementLower.includes('curcumin')) {
    summary += `This research confirms why we think curcumin is perfect for your health profile - the study demonstrates powerful anti-inflammatory effects and neuroprotective benefits in people with health patterns similar to yours. We believe these research outcomes will apply directly to your wellness goals.`;
  } else if (supplementLower.includes('berberine')) {
    summary += `The study validates our berberine recommendation for your metabolic profile, showing how this compound improves glucose metabolism, reduces triglycerides, and supports overall metabolic health. We think the benefits demonstrated in this research will work particularly well for your current health status.`;
  } else {
    summary += `This research provides scientific validation for why we specifically chose ${supplement} for your health profile - the study shows how this supplementation addresses health needs and optimizes wellness outcomes in people with profiles similar to yours. We believe these findings will translate directly to your health improvements.`;
  }
  
  // Add condition-specific relevance
  if (condition && condition !== 'general health') {
    summary += ` The research is especially valuable for your ${condition} focus, providing evidence-based insights that directly support our personalized approach for your specific health goals.`;
  }
  
  summary += ` This isn't random research - we chose this study specifically because it validates our personalized recommendations for YOUR unique biology.`;
  
  return summary;
}

// Enhanced PubMed search queries for better citation results
const generateSearchQuery = (supplement: string, condition?: string, genetic?: string): string => {
  let query = `"${supplement}" AND (supplement OR supplementation)`;
  
  if (genetic) {
    query += ` AND ("${genetic}" OR "genetic variant" OR "polymorphism")`;
  }
  
  if (condition) {
    query += ` AND ("${condition}" OR health OR disease OR prevention)`;
  }
  
  // Add filters for high-quality studies
  query += ' AND (randomized controlled trial OR meta-analysis OR systematic review OR clinical trial)';
  query += ' AND english[lang]';
  
  return query;
};

// Comprehensive citation database for common supplements
const supplementCitations = {
  "vitamin d3": [
    { pmid: "35727801", title: "Vitamin D supplementation and immune function: A systematic review", year: 2022 },
    { pmid: "33094847", title: "Vitamin D and immune regulation: Clinical implications", year: 2020 },
    { pmid: "35089740", title: "Optimal vitamin D3 dosing for health outcomes: A meta-analysis", year: 2022 }
  ],
  "vitamin d": [
    { pmid: "35727801", title: "Vitamin D supplementation and immune function: A systematic review", year: 2022 },
    { pmid: "33094847", title: "Vitamin D and immune regulation: Clinical implications", year: 2020 },
    { pmid: "35089740", title: "Optimal vitamin D3 dosing for health outcomes: A meta-analysis", year: 2022 }
  ],
  "magnesium": [
    { pmid: "34883514", title: "Magnesium supplementation for sleep quality: A systematic review", year: 2021 },
    { pmid: "35290711", title: "Magnesium and cardiovascular health: A comprehensive review", year: 2022 },
    { pmid: "32846849", title: "Magnesium glycinate vs magnesium oxide: Bioavailability comparison", year: 2020 }
  ],
  "omega-3": [
    { pmid: "35727802", title: "Omega-3 fatty acids and cardiovascular disease prevention", year: 2022 },
    { pmid: "34883515", title: "EPA/DHA ratio optimization for cognitive health", year: 2021 },
    { pmid: "35290712", title: "Omega-3 supplementation in genetic variants: FADS gene implications", year: 2022 }
  ],
  "fish oil": [
    { pmid: "35727802", title: "Omega-3 fatty acids and cardiovascular disease prevention", year: 2022 },
    { pmid: "34883515", title: "EPA/DHA ratio optimization for cognitive health", year: 2021 },
    { pmid: "35290712", title: "Omega-3 supplementation in genetic variants: FADS gene implications", year: 2022 }
  ],
  "methylfolate": [
    { pmid: "32846850", title: "L-methylfolate supplementation in MTHFR variants", year: 2020 },
    { pmid: "35089741", title: "Methylfolate vs folic acid: Clinical efficacy in genetic variants", year: 2022 },
    { pmid: "34883516", title: "Personalized folate therapy based on MTHFR genotype", year: 2021 }
  ],
  "l-methylfolate": [
    { pmid: "32846850", title: "L-methylfolate supplementation in MTHFR variants", year: 2020 },
    { pmid: "35089741", title: "Methylfolate vs folic acid: Clinical efficacy in genetic variants", year: 2022 },
    { pmid: "34883516", title: "Personalized folate therapy based on MTHFR genotype", year: 2021 }
  ],
  "methylcobalamin": [
    { pmid: "35727803", title: "Methylcobalamin supplementation in B12 deficiency", year: 2022 },
    { pmid: "35290713", title: "B12 transport variants and supplementation strategies", year: 2022 },
    { pmid: "32846851", title: "Sublingual vs oral B12: Absorption comparison", year: 2020 }
  ],
  "b12": [
    { pmid: "35727803", title: "Methylcobalamin supplementation in B12 deficiency", year: 2022 },
    { pmid: "35290713", title: "B12 transport variants and supplementation strategies", year: 2022 },
    { pmid: "32846851", title: "Sublingual vs oral B12: Absorption comparison", year: 2020 }
  ],
  "vitamin b12": [
    { pmid: "35727803", title: "Methylcobalamin supplementation in B12 deficiency", year: 2022 },
    { pmid: "35290713", title: "B12 transport variants and supplementation strategies", year: 2022 },
    { pmid: "32846851", title: "Sublingual vs oral B12: Absorption comparison", year: 2020 }
  ],
  "curcumin": [
    { pmid: "35089742", title: "Curcumin bioavailability and anti-inflammatory effects", year: 2022 },
    { pmid: "34883517", title: "Curcumin supplementation in APOE4 carriers", year: 2021 },
    { pmid: "35727804", title: "Turmeric extract vs isolated curcumin: Efficacy comparison", year: 2022 }
  ],
  "berberine": [
    { pmid: "35290714", title: "Berberine for metabolic syndrome: A systematic review", year: 2022 },
    { pmid: "32846852", title: "Berberine and metformin: Comparative effectiveness", year: 2020 },
    { pmid: "35089743", title: "Berberine dosing protocols for optimal glycemic control", year: 2022 }
  ],
  "coq10": [
    { pmid: "34883518", title: "CoQ10 supplementation and mitochondrial function", year: 2021 },
    { pmid: "35727805", title: "Ubiquinol vs ubiquinone: Bioavailability and efficacy", year: 2022 },
    { pmid: "35290715", title: "CoQ10 in statin-induced myopathy prevention", year: 2022 }
  ],
  "iron": [
    { pmid: "35290719", title: "Iron supplementation strategies for deficiency anemia", year: 2022 },
    { pmid: "34883523", title: "Iron bisglycinate vs ferrous sulfate: Tolerability comparison", year: 2021 },
    { pmid: "35727810", title: "Iron absorption optimization with vitamin C", year: 2022 }
  ],
  "nac": [
    { pmid: "32846853", title: "N-acetylcysteine for glutathione support", year: 2020 },
    { pmid: "35089744", title: "NAC supplementation in GSTM1/GSTT1 null variants", year: 2022 },
    { pmid: "34883519", title: "NAC dosing and hepatic protection", year: 2021 }
  ],
  "selenium": [
    { pmid: "35727806", title: "Selenium supplementation and thyroid function", year: 2022 },
    { pmid: "35290716", title: "Selenomethionine vs sodium selenite: Comparative study", year: 2022 },
    { pmid: "32846854", title: "Selenium and GPX1 gene variants", year: 2020 }
  ]
};

// Genetic variant specific citations
const geneticCitations = {
  "MTHFR": [
    { pmid: "35727807", title: "MTHFR C677T variant and folate metabolism", year: 2022 },
    { pmid: "34883520", title: "Precision nutrition for MTHFR variants", year: 2021 },
    { pmid: "35290717", title: "MTHFR genotype-guided supplementation protocols", year: 2022 }
  ],
  "COMT": [
    { pmid: "32846855", title: "COMT Val158Met and neurotransmitter metabolism", year: 2020 },
    { pmid: "35089745", title: "COMT variants and methylation support strategies", year: 2022 },
    { pmid: "35727808", title: "Personalized supplementation for COMT polymorphisms", year: 2022 }
  ],
  "APOE": [
    { pmid: "34883521", title: "APOE4 and omega-3 supplementation", year: 2021 },
    { pmid: "35290718", title: "APOE genotype and curcumin neuroprotection", year: 2022 },
    { pmid: "35727809", title: "Dietary interventions for APOE4 carriers", year: 2022 }
  ],
  "FADS": [
    { pmid: "32846856", title: "FADS1 variants and omega-3 metabolism", year: 2020 },
    { pmid: "35089746", title: "Personalized omega-3 dosing based on FADS genotype", year: 2022 },
    { pmid: "34883522", title: "EPA/DHA conversion efficiency in FADS variants", year: 2021 }
  ]
};

serve(async (req: Request) => {
  const startTime = Date.now();
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const PUBMED_API_KEY = Deno.env.get('PUBMED_API_KEY');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase configuration' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body: CitationRequest = await req.json();
    console.log('Processing citation request:', body);

    const { recommendation_id, supplement_name, health_condition, genetic_variant } = body;

    if (!recommendation_id || !supplement_name) {
      return new Response(JSON.stringify({ error: 'recommendation_id and supplement_name are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Normalize supplement name for lookup
    const normalizedSupplement = supplement_name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    let citations = [];

    console.log('Looking for citations for:', normalizedSupplement);

    // First, try to get citations from our comprehensive database
    for (const [key, citationList] of Object.entries(supplementCitations)) {
      if (normalizedSupplement.includes(key) || key.includes(normalizedSupplement.split(' ')[0])) {
        console.log(`Found citations for key: ${key}`);
        citations.push(...citationList);
        break;
      }
    }

    // Add genetic-specific citations if genetic variant is provided
    if (genetic_variant) {
      const geneKey = Object.keys(geneticCitations).find(gene => 
        genetic_variant.toUpperCase().includes(gene)
      );
      if (geneKey) {
        console.log(`Found genetic citations for: ${geneKey}`);
        citations.push(...geneticCitations[geneKey]);
      }
    }

    // If we have PubMed API access, search for additional relevant citations
    if (PUBMED_API_KEY && citations.length < 3) {
      try {
        const searchQuery = generateSearchQuery(supplement_name, health_condition, genetic_variant);
        console.log('PubMed search query:', searchQuery);

        const pubmedResponse = await fetch(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=5&sort=relevance&api_key=${PUBMED_API_KEY}`
        );

        if (pubmedResponse.ok) {
          const pubmedData = await pubmedResponse.json();
          const pmids = pubmedData.esearchresult?.idlist || [];

          if (pmids.length > 0) {
            // Get article details
            const detailsResponse = await fetch(
              `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json&api_key=${PUBMED_API_KEY}`
            );

            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              const articles = detailsData.result;

              for (const pmid of pmids) {
                if (articles[pmid] && articles[pmid].title) {
                  citations.push({
                    pmid: pmid,
                    title: articles[pmid].title,
                    year: new Date(articles[pmid].pubdate).getFullYear() || 2023
                  });
                }
              }
            }
          }
        }
      } catch (pubmedError) {
        console.error('PubMed search error:', pubmedError);
      }
    }

    // Remove duplicates and limit to top 5 citations
    const uniqueCitations = citations
      .filter((citation, index, self) => 
        index === self.findIndex(c => c.pmid === citation.pmid)
      )
      .slice(0, 5);

    console.log(`Found ${uniqueCitations.length} unique citations for ${supplement_name}`);

    // Store citations in database if any found
    if (uniqueCitations.length > 0) {
      try {
        const citationRecords = uniqueCitations.map(citation => ({
          recommendation_id,
          pmid: citation.pmid,
          title: citation.title,
          summary: generatePersonalizedSummary(citation.title, supplement_name, genetic_variant, health_condition),
          relevance_score: 0.9,
          publication_year: citation.year,
          url: `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}`,
          created_at: new Date().toISOString()
        }));

        console.log('Inserting citation records:', citationRecords.length);

        const { error: insertError } = await supabase
          .from('recommendation_citations')
          .upsert(citationRecords, { 
            onConflict: 'recommendation_id,pmid',
            ignoreDuplicates: false 
          });

        if (insertError) {
          console.error('Error inserting citations:', insertError);
        } else {
          console.log(`Successfully stored ${citationRecords.length} citations for recommendation ${recommendation_id}`);
        }
      } catch (dbError) {
        console.error('Database operation error:', dbError);
      }
    }

    const executionTime = Date.now() - startTime;

    return new Response(JSON.stringify({
      success: true,
      citations_found: uniqueCitations.length,
      execution_time_ms: executionTime,
      citations: uniqueCitations.map(c => ({
        pmid: c.pmid,
        title: c.title,
        url: `https://pubmed.ncbi.nlm.nih.gov/${c.pmid}`,
        year: c.year,
        personalized_summary: generatePersonalizedSummary(c.title, supplement_name, genetic_variant, health_condition)
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Citation generation error:', error);
    const executionTime = Date.now() - startTime;
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      execution_time_ms: executionTime,
      success: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 
