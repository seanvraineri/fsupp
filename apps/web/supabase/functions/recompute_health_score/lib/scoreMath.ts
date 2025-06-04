export interface Components {
  baseline: number; // 0-100
  symptoms: number; // -100..+100 delta then mapped
  adherence: number; // 0-100
  biomarkers: number; // 0-100
}

export const WEIGHTS: Record<keyof Components, number> = {
  baseline: 0.4,
  symptoms: 0.25,
  adherence: 0.15,
  biomarkers: 0.2,
};

export function weightedScore(c: Components): number {
  let total = 0;
  (Object.keys(c) as (keyof Components)[]).forEach((k) => {
    total += c[k] * WEIGHTS[k];
  });
  return clamp(total, 0, 100);
}

export function ema(prev: number, raw: number, alpha = 0.15): number {
  return clamp(alpha * raw + (1 - alpha) * prev, 0, 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
} 
