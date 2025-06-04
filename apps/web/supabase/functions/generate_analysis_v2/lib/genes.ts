// deno-lint-ignore-file
// @ts-nocheck

export interface GeneVariant { gene: string; snp: string; effect: string; allele: string; }

export function summariseGenes(genes: GeneVariant[]): string {
  if (!genes?.length) return "No genetic data available.";
  const lines = ["Notable gene variants:"];
  for (const g of genes) {
    lines.push(`• ${g.gene} (${g.snp}): ${g.allele} – ${g.effect}`);
  }
  return lines.join("\n");
} 
