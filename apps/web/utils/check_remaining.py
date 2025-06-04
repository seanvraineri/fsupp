#!/usr/bin/env python3
import json

# Load completed supplements
with open('supplement_products.json', 'r') as f:
    completed = set(json.load(f).keys())

# Full list
all_supplements = [
    'Vitamin A (Retinyl Palmitate)', 'Vitamin C (Ascorbic Acid)', 'Vitamin D3 (Cholecalciferol)',
    'Vitamin K2 (MK-7)', 'Vitamin E (Mixed Tocopherols)', 'Thiamin (B1)', 'Riboflavin-5′-Phosphate (B2)',
    'Niacinamide (B3)', 'Pantethine (B5)', 'Pyridoxal-5′-Phosphate (B6)', 'Biotin (B7)',
    '5-MTHF (Methylfolate, B9)', 'Methylcobalamin (B12)', 'Choline Bitartrate', 'Myo-Inositol',
    'Calcium Citrate', 'Magnesium Bisglycinate', 'Zinc Picolinate', 'Selenium Methionine',
    'Iodine (Potassium Iodide)', 'Manganese Bisglycinate', 'Copper Bisglycinate', 'Chromium Picolinate',
    'Boron Glycinate', 'Molybdenum Glycinate', 'Fish-Oil (EPA/DHA)', 'Algae Oil (Vegan Ω-3)',
    'Krill Oil', 'Cod-Liver Oil', 'Evening-Primrose Oil', 'Borage-Seed Oil', 'Flaxseed Oil',
    'CLA', 'GLA', 'Phosphatidylcholine (Sunflower Lecithin)', 'L-Glutamine', 'L-Taurine',
    'L-Tyrosine', 'L-Tryptophan', 'Glycine', 'L-Theanine', 'L-Arginine', 'L-Citrulline',
    'Creatine Monohydrate', 'Beta-Alanine', 'Carnitine Tartrate', 'Acetyl-L-Carnitine', 'Carnosine',
    'BCAA Blend', 'L-Methionine', 'L-Ornithine', 'L-Histidine', 'Collagen Peptides', 'Alpha-Lipoic Acid',
    'CoQ10 (Ubiquinone)', 'Ubiquinol', 'PQQ', 'Resveratrol', 'Meriva-SF (Curcumin Phytosome)',
    'Quercetin Phytosome', 'Sulforaphane', 'Astaxanthin', 'Glutathione (reduced)', 'N-Acetyl-Cysteine (NAC)',
    'Liposomal Vitamin C', 'Grape-Seed Extract', 'Green-Tea Extract (EGCG)', 'Lycopene', 'β-Carotene',
    'R-Lipoic Acid', 'Ashwagandha (KSM-66)', 'Rhodiola rosea', 'Panax Ginseng', 'American Ginseng',
    'Eleuthero (Siberian Ginseng)', 'Holy Basil', 'Bacopa monnieri', 'Lion\'s Mane Mushroom',
    'Cordyceps militaris', 'Reishi Mushroom', 'Chaga Mushroom', 'Maitake Mushroom', 'Ginkgo biloba',
    'Gotu Kola', 'Maca Root', 'Schisandra chinensis', 'Astragalus membranaceus', 'Saffron Extract',
    'Huperzine A', 'Alpha-GPC', 'Phosphatidylserine', 'Pterostilbene', 'DHEA', 'Pregnenolone',
    '7-Keto DHEA', 'Iodoral (High-Dose Iodine)', 'DIM (Diindolylmethane)', 'Calcium-D-Glucarate',
    'Betaine Anhydrous (TMG)', 'Berberine HCl', 'Chromium–Vanadium Complex', 'Cinnulin-PF (Cinnamon Extract)',
    'Green-Coffee-Bean Extract', 'White-Kidney-Bean Extract', 'Fucoxanthin', 'Cayenne Extract',
    'Glucosamine Sulfate', 'Chondroitin Sulfate', 'MSM', 'Hyaluronic Acid', 'Strontium Citrate',
    'Boswellia Serrata', 'BCM-95 (Curcugreen Turmeric)', 'Multi-Strain Probiotic (50 B CFU)',
    'Saccharomyces boulardii', 'Spore-Based Probiotic', 'Betaine HCl & Pepsin', 'Pancreatin Enzymes',
    'Ox Bile Extract', 'Bromelain', 'Papain', 'Serrapeptase', 'Slippery Elm Bark', 'Aloe-Vera Extract',
    'DGL Licorice', 'Enteric-Coated Peppermint Oil', 'Butyrate (Tributyrin)', 'Zinc Carnosine',
    'Colostrum (Bovine)', 'Melatonin 0.3 mg', 'Valerian Root', 'Passionflower', 'Lemon Balm', 'GABA',
    'Relora', '5-HTP', 'CBD Softgels', 'Apigenin', 'Elderberry Extract', 'Echinacea Purpurea',
    'Andrographis', 'Olive-Leaf Extract', 'Oregano-Oil Softgels', 'β-Glucans',
    '10X Optimize Methylated Multivitamin', '10X Magnesium Glycinate', '10X Vitamin D3/K2', '10X Zinc Complex',
    'Thorne Basic Nutrients 2/Day', 'Thorne Basic Nutrients 5/Day', 'Thorne Methyl-Guard Plus',
    'Thorne NAC 900', 'Thorne ResveraCel (NR + PT)', 'Thorne Niacel 400', 'Thorne Q-Best 100',
    'Thorne FloraMend Prime', 'Thorne Berbercap', 'Thorne Perma-Clear', 'Thorne D-Glucarate',
    'Thorne Creatine', 'Thorne Magnesium Bisglycinate Powder', 'Thorne Vitamin D/K2 Liquid',
    'Thorne PolyResveratrol-SRT', 'Pure Encap O.N.E. Multivitamin', 'Pure Encap PureGenomics Multi',
    'Pure Encap B-Complex Plus', 'Pure Encap 5-MTHF 1 mg', 'Pure Encap Methyl-B12 5 mg',
    'Pure Encap Magnesium Glycinate', 'Pure Encap Resveratrol 200', 'Pure Encap Quercetin 250',
    'Pure Encap Alpha-Lipoic Acid 600', 'Pure Encap NAC 600', 'Pure Encap EPA/DHA Essentials',
    'Pure Encap L-Theanine 200', 'Pure Encap L-Tryptophan', 'Pure Encap Probiotic G.I.',
    'Pure Encap DHEA 25 mg', 'Pure Encap Curcumin 500', 'Pure Encap Pancreatic Enzyme',
    'Pure Encap CoQ10 250', 'Pure Encap Vitamin D3 5000 IU', 'Pure Encap Iron-C',
    'NMN (Nicotinamide Mononucleotide)', 'NR (Nicotinamide Riboside)', 'Spermidine', 'D-Ribose',
    'HMB (β-Hydroxy-β-Methylbutyrate)', 'PEA (Palmitoylethanolamide)', 'Serratiopeptidase',
    'S-Adenosyl-L-Methionine (SAMe)', 'Tauroursodeoxycholic Acid (TUDCA)', 'Policosanol',
    'Red-Yeast Rice', 'Citrus Bergamot Extract', 'Guggulsterone', 'Propolis Extract', 'Bee Pollen',
    'Royal Jelly', 'Triphala (Indian Herbal Blend)'
]

remaining = [s for s in all_supplements if s not in completed]
print(f'Completed: {len(completed)} supplements')
print(f'Remaining: {len(remaining)} supplements')
print(f'\nNext to process:')
for i, s in enumerate(remaining[:10], 1):
    print(f'  {i}. {s}')

# Save remaining list
with open('remaining_supplements.txt', 'w') as f:
    for s in remaining:
        f.write(f'{s}\n')
print(f'\nRemaining supplements saved to remaining_supplements.txt') 
