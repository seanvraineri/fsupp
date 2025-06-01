"use client";
import DashboardShell from '../../components/DashboardShell';
import TestCard from '../../components/TestCard';

const geneticTests = [
  {
    logo: '/logos/23andme.svg',
    title: '23andMe — Ancestry + Traits',
    desc: '650k-SNP TXT file. Reports are ancestry-only, we add dosing.',
    link: 'https://www.23andme.com/compare/',
    price: '$119',
  },
  {
    logo: '/logos/nebula.svg',
    title: 'Nebula Genomics — 30× WGS',
    desc: 'CLIA-grade whole genome. VCF/CRAM download → we slice nutrition SNPs.',
    link: 'https://dnacomplete.com/tier-selection/',
    price: '$299',
  },
];

export default function TestsPage() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold mb-8">Order Genetic Test Kit</h1>

      <h2 className="text-xl font-semibold mb-4">🧬 Genetic Kits</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {geneticTests.map((t) => (
          <TestCard key={t.title} logoSrc={t.logo} title={t.title} description={t.desc} href={t.link} price={t.price} />
        ))}
      </div>

      {/* Bring Your Own Data section */}
      <details className="mt-8 rounded-lg border dark:border-gray-700 p-4">
        <summary className="font-medium cursor-pointer">🔎 Bringing Your Own Data? – Compatibility Checklist</summary>
        <div className="mt-4 space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p className="mb-4 leading-relaxed">Already invested in a genetic test or recent blood work?  Awesome—there's no need to buy another kit.  Just make sure your file checks the boxes below so our parser can crunch the numbers and turn them into precise dosages.</p>

          {/* Genetic checklist */}
          <div>
            <h3 className="font-semibold mb-2 text-primary-from">Genetic-file essentials</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code>.txt</code>, <code>.csv</code> or <code>.vcf</code> &nbsp;— raw data exports only (screenshots won't work).</li>
              <li>Contains the "nutrition SNPs" we rely on:<br/>
                <span className="ml-2 text-xs">MTHFR C677T / A1298C • MTRR A66G • VDR FokI / BsmI • COMT Val158Met • GSTM1 / GSTT1 deletion • APOE rs429358 / rs7412</span>
              </li>
              <li>From a CLIA- or CAP-certified provider (23andMe, Ancestry, Nebula, Dante, etc.).</li>
              <li>File size &lt; 10 MB for chip data, &lt; 25 GB for whole-genome <code>.vcf</code>.</li>
            </ul>
          </div>

          {/* Lab checklist */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-primary-from">Lab-result essentials</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Numeric results with units (e.g., <code>25-OH Vit-D &nbsp;28 ng/mL</code>).</li>
              <li>Includes at least <span className="italic">10 core markers</span>: Vit-D, RBC Mg, Ferritin, Homocysteine, hs-CRP, HbA1c, LDL, HDL, TG, ALT.</li>
              <li><code>.pdf</code> or <code>.csv</code> under 5 MB.</li>
            </ul>
          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Our uploader will automatically validate these requirements.  If something's missing you'll get an instant pop-up with what to fix.</p>

          <div className="pt-3 text-xs leading-snug text-gray-500 dark:text-gray-400">
            <h4 className="font-semibold mb-1">Why so strict?</h4>
            <p>Those SNPs control folate recycling, vitamin-D activation, lipid response and detox pathways—cornerstones of our dosing engine.  The lab markers let us avoid over-supplementing and fine-tune cofactors.  When they're absent we can still build a starter plan, but accuracy drops.</p>
          </div>
        </div>
      </details>
    </DashboardShell>
  );
} 