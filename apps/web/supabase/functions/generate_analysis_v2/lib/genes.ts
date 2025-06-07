// deno-lint-ignore-file
// @ts-nocheck

import { getSNPInfo, getSNPSupplementRecommendations, getSNPsByPathway, SNP_DATABASE } from './snp_database.ts';

export interface GeneVariant { gene: string; snp: string; effect: string; allele: string; }

export function summariseGenes(genes: GeneVariant[]): string {
  if (!genes?.length) return "No genetic data available.";
  const lines = ["Notable gene variants:"];
  for (const g of genes) {
    lines.push(`• ${g.gene} (${g.snp}): ${g.allele} – ${g.effect}`);
  }
  return lines.join("\n");
}

// NEW: Comprehensive genetic analysis using actual snp_data
export function summariseComprehensiveGenes(geneticData: any[]): string {
  if (!geneticData || geneticData.length === 0) {
    return "No genetic data available.";
  }

  let totalSNPs = 0;
  let knownSNPs = 0;
  let pathwaysSeen = new Set<string>();
  let importantFindings: string[] = [];

  for (const sample of geneticData) {
    if (sample.snp_data) {
      const snpData = sample.snp_data;
      totalSNPs += Object.keys(snpData).length;

      // Check each SNP against our comprehensive database
      for (const [rsid, genotype] of Object.entries(snpData)) {
        const snpInfo = getSNPInfo(rsid);
        if (snpInfo) {
          knownSNPs++;
          pathwaysSeen.add(snpInfo.pathway);
          
          // Check if this is a significant variant
          const variant = snpInfo.variants[genotype as string];
          if (variant && variant.phenotype.includes('reduced') || variant?.phenotype.includes('risk')) {
            importantFindings.push(`${rsid} (${snpInfo.gene}): ${variant.phenotype}`);
          }
        }
      }
    }
  }

  const pathwaysAnalyzed = Array.from(pathwaysSeen).join(', ');
  
  return `Analyzed ${totalSNPs.toLocaleString()} total SNPs across ${geneticData.length} genetic file(s). 
${knownSNPs} SNPs matched our comprehensive database covering pathways: ${pathwaysAnalyzed}.
${importantFindings.length > 0 ? `\n\nKey findings: ${importantFindings.slice(0, 5).join('; ')}` : ''}`;
}

// Identify genetic concerns for personalized recommendations
export function identifyGeneticConcerns(geneticData: any[]): string[] {
  const concerns: string[] = [];
  
  if (!geneticData || geneticData.length === 0) {
    return concerns;
  }

  for (const sample of geneticData) {
    if (sample.snp_data) {
      const snpData = sample.snp_data;

      for (const [rsid, genotype] of Object.entries(snpData)) {
        const snpInfo = getSNPInfo(rsid);
        if (snpInfo) {
          const variant = snpInfo.variants[genotype as string];
          if (variant) {
            // Flag high-impact variants
            if (variant.phenotype.includes('reduced') && 
                (variant.phenotype.includes('30%') || variant.phenotype.includes('significantly'))) {
              concerns.push(`${snpInfo.gene} ${rsid}: ${variant.phenotype} - Requires targeted supplementation`);
            }
            
            // Flag risk variants
            if (variant.phenotype.includes('risk') || variant.phenotype.includes('carrier')) {
              concerns.push(`${snpInfo.gene} ${rsid}: ${variant.phenotype} - Monitor and optimize lifestyle`);
            }

            // Flag contraindicated supplements
            if (variant.contraindications?.some(contra => contra.includes('Never') || contra.includes('Avoid'))) {
              concerns.push(`${snpInfo.gene} ${rsid}: Important supplement contraindications - ${variant.contraindications.join('; ')}`);
            }
          }
        }
      }
    }
  }

  return concerns;
}

// Generate personalized supplement recommendations based on genetics
export function generateGeneticSupplementRecommendations(geneticData: any[]): string[] {
  const recommendations: string[] = [];
  const supplementProtocol = new Map<string, {
    dosage: string;
    timing: string;
    rsids: string[];
    priority: number;
  }>();

  if (!geneticData || geneticData.length === 0) {
    return recommendations;
  }

  for (const sample of geneticData) {
    if (sample.snp_data) {
      const snpData = sample.snp_data;

      for (const [rsid, genotype] of Object.entries(snpData)) {
        const snpInfo = getSNPInfo(rsid);
        if (snpInfo) {
          const variant = snpInfo.variants[genotype as string];
          if (variant && variant.supplements.length > 0) {
            // Process each supplement recommendation
            variant.supplements.forEach((supplement, index) => {
              const dosage = variant.dosages[index] || 'As directed';
              const timing = variant.timing[index] || 'With food';
              
              // Determine priority based on phenotype severity
              let priority = 1;
              if (variant.phenotype.includes('significantly') || variant.phenotype.includes('high risk')) {
                priority = 3;
              } else if (variant.phenotype.includes('reduced') || variant.phenotype.includes('moderate')) {
                priority = 2;
              }

              if (supplementProtocol.has(supplement)) {
                const existing = supplementProtocol.get(supplement)!;
                existing.rsids.push(rsid);
                existing.priority = Math.max(existing.priority, priority);
              } else {
                supplementProtocol.set(supplement, {
                  dosage,
                  timing,
                  rsids: [rsid],
                  priority
                });
              }
            });
          }
        }
      }
    }
  }

  // Convert to recommendations sorted by priority
  const sortedSupplements = Array.from(supplementProtocol.entries())
    .sort(([,a], [,b]) => b.priority - a.priority);

  for (const [supplement, info] of sortedSupplements) {
    const priorityText = info.priority === 3 ? 'HIGH PRIORITY' : 
                        info.priority === 2 ? 'MODERATE PRIORITY' : 'STANDARD';
    
    recommendations.push(
      `${supplement} - ${info.dosage} (${info.timing}) - ${priorityText} - Based on: ${info.rsids.join(', ')}`
    );
  }

  return recommendations;
}

// New function to get pathway-specific recommendations
export function getPathwayOptimization(geneticData: any[], pathway: string): string {
  const pathwaySNPs = getSNPsByPathway(pathway);
  let optimization = `${pathway} Pathway Optimization:\n\n`;
  
  const foundVariants: string[] = [];
  
  for (const sample of geneticData) {
    if (sample.snp_data) {
      const snpData = sample.snp_data;
      
      for (const snpInfo of pathwaySNPs) {
        const genotype = snpData[snpInfo.rsid];
        if (genotype) {
          const variant = snpInfo.variants[genotype];
          if (variant) {
            foundVariants.push(`${snpInfo.rsid} (${snpInfo.gene}): ${variant.phenotype}`);
            
            // Add specific recommendations for this variant
            if (variant.supplements.length > 0) {
              optimization += `\n${snpInfo.gene} ${snpInfo.rsid} Protocol:\n`;
              variant.supplements.forEach((supplement, index) => {
                optimization += `- ${supplement}: ${variant.dosages[index]} ${variant.timing[index]}\n`;
              });
            }
          }
        }
      }
    }
  }
  
  if (foundVariants.length === 0) {
    optimization += "No relevant variants found in this pathway.";
  }
  
  return optimization;
} 
