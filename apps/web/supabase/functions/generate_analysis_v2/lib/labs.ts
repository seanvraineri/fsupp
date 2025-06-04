// deno-lint-ignore-file
// @ts-nocheck

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
