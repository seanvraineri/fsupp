export const allergyConflicts: Record<string, string[]> = {
  shellfish: ['Glucosamine', 'Chondroitin', 'Chitosan', 'Marine Collagen', 'Krill Oil'],
  fish: ['Fish Oil', 'Cod Liver Oil'],
  soy: ['Soy Lecithin', 'Soy Isoflavones', 'Soy Protein'],
  ragweed: ['Chamomile', 'Echinacea', 'Dandelion', 'Milk Thistle', 'Artichoke'],
  latex: ['Avocado Powder', 'Banana Powder', 'Kiwi Powder', 'Papaya Powder', 'Mango Powder', 'Passionfruit Powder', 'Fig Powder', 'Melon Powder', 'Tomato Powder'],
  bee: ['Bee Pollen', 'Propolis', 'Royal Jelly'],
};

export const drugConflicts: Record<string, string[]> = {
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
