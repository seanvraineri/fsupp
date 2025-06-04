export interface Components {
  micronutrients: number;       // 0-100
  inflam_lipids: number;       // 0-100
  genetics: number;            // 0-100
  lifestyle: number;           // 0-100
  adherence: number;           // 0-100
  weight_trend: number;        // 0-100
}

export const WEIGHTS: Record<keyof Components, number> = {
  micronutrients: 0.30,
  inflam_lipids: 0.20,
  genetics: 0.15,
  lifestyle: 0.15,
  adherence: 0.10,
  weight_trend: 0.10,
}; 
