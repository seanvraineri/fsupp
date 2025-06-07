// deno-lint-ignore-file
// @ts-nocheck

import { getBiomarkerInfo, assessBiomarkerStatus, getBiomarkersByCategory, BIOMARKER_DATABASE } from './biomarker_database.ts';
import { getAllBiomarkerInfo, EXTENDED_BIOMARKER_DATABASE, assessComprehensiveBiomarkerStatus } from './extended_biomarker_database.ts';

// Helper function to get biomarker info from both databases
function getComprehensiveBiomarkerInfo(biomarkerName: string) {
  return getBiomarkerInfo(biomarkerName) || getAllBiomarkerInfo(biomarkerName);
}

export interface LabResult {
  name: string;
  value: number;
  unit: string;
  normal_low?: number;
  normal_high?: number;
  collected_at?: string;
}

export function summariseLabs(labs: LabResult[]): string {
  if (!labs?.length) return "No lab data available.";
  const abnormalities = labs.filter((l) => {
    if (l.normal_low === undefined || l.normal_high === undefined) return false;
    return l.value < l.normal_low || l.value > l.normal_high;
  });

  const lines: string[] = [];
  if (abnormalities.length) {
    lines.push("Abnormal biomarkers:");
    for (const lab of abnormalities) {
      lines.push(`• ${lab.name}: ${lab.value}${lab.unit} (normal ${lab.normal_low}-${lab.normal_high})`);
    }
  } else {
    lines.push("All biomarkers within normal reference ranges.");
  }

  return lines.join("\n");
}

// NEW: Comprehensive lab analysis using actual biomarker_data
export function summariseComprehensiveLabs(comprehensiveLabs: any[]): string {
  if (!comprehensiveLabs?.length) return "No comprehensive lab data available.";
  
  let totalBiomarkers = 0;
  let knownBiomarkers = 0;
  let categoriesSeen = new Set<string>();
  let flaggedValues: string[] = [];
  
  const lines: string[] = [];
  
  for (const lab of comprehensiveLabs) {
    if (lab.biomarker_data && Object.keys(lab.biomarker_data).length > 0) {
      const biomarkerCount = lab.biomarker_count || Object.keys(lab.biomarker_data).length;
      totalBiomarkers += biomarkerCount;
      
      const testDate = lab.test_date ? new Date(lab.test_date).toLocaleDateString() : 'Unknown date';
      const labName = lab.lab_name || 'Unknown Lab';
      
      lines.push(`\n**Lab Results from ${labName} (${testDate}):**`);
      lines.push(`**${biomarkerCount} biomarkers analyzed:**`);
      
      // Analyze each biomarker against our comprehensive database
      for (const [biomarkerName, value] of Object.entries(lab.biomarker_data)) {
        if (typeof value === 'number') {
          const biomarkerInfo = getComprehensiveBiomarkerInfo(biomarkerName);
          if (biomarkerInfo) {
            knownBiomarkers++;
            categoriesSeen.add(biomarkerInfo.category);
            
            const assessment = assessComprehensiveBiomarkerStatus(biomarkerName, value);
            if (assessment.status !== 'optimal') {
              flaggedValues.push(`${biomarkerInfo.name}: ${value} ${biomarkerInfo.optimal_range.unit} (${assessment.status.toUpperCase()})`);
            }
          }
        }
      }
      
      // Show biomarkers by category
      const categorizedBiomarkers = new Map<string, Array<{name: string, value: any, status: string}>>();
      
      for (const [biomarkerName, value] of Object.entries(lab.biomarker_data)) {
        const biomarkerInfo = getComprehensiveBiomarkerInfo(biomarkerName);
        const category = biomarkerInfo?.category || 'Other';
        
        if (!categorizedBiomarkers.has(category)) {
          categorizedBiomarkers.set(category, []);
        }
        
        const assessment = biomarkerInfo ? assessComprehensiveBiomarkerStatus(biomarkerName, value as number) : { status: 'unknown' };
        categorizedBiomarkers.get(category)!.push({
          name: biomarkerInfo?.name || biomarkerName,
          value,
          status: assessment.status
        });
      }
      
      // Display by category
      for (const [category, biomarkers] of categorizedBiomarkers) {
        if (biomarkers.length > 0) {
          lines.push(`\n• **${category}:**`);
          for (const biomarker of biomarkers.slice(0, 8)) { // Show max 8 per category
            const statusIcon = biomarker.status === 'optimal' ? '✓' : 
                             biomarker.status === 'low' ? '↓' :
                             biomarker.status === 'high' ? '↑' : '-';
            lines.push(`  ${statusIcon} ${biomarker.name}: ${biomarker.value}`);
          }
          if (biomarkers.length > 8) {
            lines.push(`  *(Plus ${biomarkers.length - 8} additional ${category.toLowerCase()} markers)*`);
          }
        }
      }
    }
  }
  
  lines.unshift(`Analyzed ${totalBiomarkers} total biomarkers across ${comprehensiveLabs.length} lab test(s).`);
  lines.unshift(`${knownBiomarkers} biomarkers matched our comprehensive database covering: ${Array.from(categoriesSeen).join(', ')}.`);
  
  if (flaggedValues.length > 0) {
    lines.push(`\n**Values requiring attention:** ${flaggedValues.slice(0, 5).join('; ')}`);
    if (flaggedValues.length > 5) {
      lines.push(`*(Plus ${flaggedValues.length - 5} additional flagged values)*`);
    }
  }
  
  return lines.join('\n');
}

// Identify potential biomarker concerns for recommendations
export function identifyLabConcerns(comprehensiveLabs: any[]): string[] {
  const concerns: string[] = [];
  
  if (!comprehensiveLabs?.length) return concerns;
  
  for (const lab of comprehensiveLabs) {
    if (lab.biomarker_data) {
      for (const [biomarkerName, value] of Object.entries(lab.biomarker_data)) {
        if (typeof value === 'number') {
          const biomarkerInfo = getComprehensiveBiomarkerInfo(biomarkerName);
          if (biomarkerInfo) {
            const assessment = assessComprehensiveBiomarkerStatus(biomarkerName, value);
            
            if (assessment.urgency === 'high') {
              if (assessment.status === 'low') {
                concerns.push(`${biomarkerInfo.name} critically low (${value} ${biomarkerInfo.optimal_range.unit}) - ${biomarkerInfo.low_values.symptoms.join(', ')}`);
              } else if (assessment.status === 'high') {
                concerns.push(`${biomarkerInfo.name} critically high (${value} ${biomarkerInfo.optimal_range.unit}) - ${biomarkerInfo.high_values.symptoms.join(', ')}`);
              }
            } else if (assessment.urgency === 'moderate') {
              if (assessment.status === 'low') {
                concerns.push(`${biomarkerInfo.name} below optimal (${value} ${biomarkerInfo.optimal_range.unit}) - Consider: ${assessment.recommendations.slice(0, 3).join(', ')}`);
              } else if (assessment.status === 'high') {
                concerns.push(`${biomarkerInfo.name} above optimal (${value} ${biomarkerInfo.optimal_range.unit}) - Consider: ${assessment.recommendations.slice(0, 3).join(', ')}`);
              }
            }
          }
        }
      }
    }
  }
  
  return concerns;
}

// New function to generate comprehensive supplement protocol
export function generateLabSupplementProtocol(comprehensiveLabs: any[]): string[] {
  const protocol: string[] = [];
  const supplementMap = new Map<string, {
    dosage: string;
    timing: string;
    biomarkers: string[];
    urgency: string;
  }>();
  
  if (!comprehensiveLabs?.length) return protocol;
  
  for (const lab of comprehensiveLabs) {
    if (lab.biomarker_data) {
      for (const [biomarkerName, value] of Object.entries(lab.biomarker_data)) {
        if (typeof value === 'number') {
          const biomarkerInfo = getComprehensiveBiomarkerInfo(biomarkerName);
          if (biomarkerInfo) {
            const assessment = assessComprehensiveBiomarkerStatus(biomarkerName, value);
            
            if (assessment.status !== 'optimal' && assessment.recommendations.length > 0) {
              const relevantData = assessment.status === 'low' ? 
                biomarkerInfo.low_values : biomarkerInfo.high_values;
              
              assessment.recommendations.forEach((supplement, index) => {
                const dosage = relevantData.dosages[index] || 'As directed';
                const timing = relevantData.timing[index] || 'With food';
                
                if (supplementMap.has(supplement)) {
                  const existing = supplementMap.get(supplement)!;
                  existing.biomarkers.push(biomarkerInfo.name);
                  // Keep highest urgency
                  if (assessment.urgency === 'high' || (assessment.urgency === 'moderate' && existing.urgency === 'low')) {
                    existing.urgency = assessment.urgency;
                  }
                } else {
                  supplementMap.set(supplement, {
                    dosage,
                    timing,
                    biomarkers: [biomarkerInfo.name],
                    urgency: assessment.urgency
                  });
                }
              });
            }
          }
        }
      }
    }
  }
  
  // Sort by urgency and convert to protocol
  const sortedSupplements = Array.from(supplementMap.entries())
    .sort(([,a], [,b]) => {
      const urgencyOrder = { 'high': 3, 'moderate': 2, 'low': 1 };
      return urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder];
    });
  
  for (const [supplement, info] of sortedSupplements) {
    const urgencyText = info.urgency === 'high' ? 'URGENT' : 
                      info.urgency === 'moderate' ? 'PRIORITY' : 'STANDARD';
    
    protocol.push(
      `${supplement} - ${info.dosage} (${info.timing}) - ${urgencyText} - Addresses: ${info.biomarkers.join(', ')}`
    );
  }
  
  return protocol;
}

// New function to get category-specific optimization
export function getCategoryOptimization(comprehensiveLabs: any[], category: string): string {
  const categoryBiomarkers = getBiomarkersByCategory(category);
  let optimization = `${category} Optimization Protocol:\n\n`;
  
  const foundIssues: string[] = [];
  
  for (const lab of comprehensiveLabs) {
    if (lab.biomarker_data) {
      for (const biomarkerInfo of categoryBiomarkers) {
        const normalizedName = biomarkerInfo.name.toLowerCase().replace(/[-_\s]/g, '_');
        const value = lab.biomarker_data[normalizedName];
        
        if (typeof value === 'number') {
          const assessment = assessComprehensiveBiomarkerStatus(normalizedName, value);
          
          if (assessment.status !== 'optimal') {
            foundIssues.push(`${biomarkerInfo.name}: ${value} ${biomarkerInfo.optimal_range.unit} (${assessment.status})`);
            
            const relevantData = assessment.status === 'low' ? 
              biomarkerInfo.low_values : biomarkerInfo.high_values;
            
            optimization += `\n${biomarkerInfo.name} Protocol (${assessment.status}):\n`;
            relevantData.supplements.forEach((supplement, index) => {
              optimization += `- ${supplement}: ${relevantData.dosages[index]} ${relevantData.timing[index]}\n`;
            });
            
            if (relevantData.interactions.length > 0) {
              optimization += `  Interactions: ${relevantData.interactions.join('; ')}\n`;
            }
          }
        }
      }
    }
  }
  
  if (foundIssues.length === 0) {
    optimization += `All ${category.toLowerCase()} markers appear optimal based on available data.`;
  }
  
  return optimization;
} 
