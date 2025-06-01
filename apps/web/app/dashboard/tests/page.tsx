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
          <div>
            <p className="font-semibold mb-1">✅ Must-haves for genetic files</p>
            <ul className="list-disc list-inside space-y-1">
              <li>.txt, .csv or .vcf (not screenshots)</li>
              <li>Includes SNPs: MTHFR C677T/A1298C, MTRR A66G, VDR FokI/BsmI, COMT Val158Met, GSTM1/GSTT1, APOE rs429358/rs7412</li>
              <li>CLIA or CAP-certified lab / provider</li>
              <li>File under 10 MB for TXT/CSV or 25 GB for WGS VCF</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">✅ Must-haves for lab PDFs</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Numeric values with units (e.g., "25-OH Vit-D 28 ng/mL")</li>
              <li>Contains at least: Vit-D, RBC Mg, Ferritin, Homocysteine, hs-CRP, HbA1c, LDL, HDL, TG, ALT</li>
              <li>PDF or CSV under 5 MB</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Our uploader runs a quick schema check and will flag missing critical markers before processing.</p>
        </div>
      </details>
    </DashboardShell>
  );
} 