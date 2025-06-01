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
    link: 'https://nebula.org/wgs/',
    price: '$299',
  },
];

const labTests = [
  {
    logo: '/logos/labcorp.svg',
    title: 'Labcorp OnDemand — Comprehensive Health',
    desc: 'CMP, CBC, lipids, HbA1c, TSH, iron + optional vitamin D.',
    link: 'https://ondemand.labcorp.com/',
    price: '$169',
  },
  {
    logo: '/logos/everlywell.svg',
    title: 'Everlywell — Vitamins & Minerals',
    desc: 'Vit-D, B-12, ferritin, RBC magnesium, hs-CRP.',
    link: 'https://www.everlywell.com/products/vitamins-minerals-test/',
    price: '$109',
  },
];

export default function TestsPage() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold mb-8">Order At-Home Tests</h1>

      <h2 className="text-xl font-semibold mb-4">🧬 Genetic Kits</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {geneticTests.map((t) => (
          <TestCard key={t.title} logoSrc={t.logo} title={t.title} description={t.desc} href={t.link} price={t.price} />
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">🩸 Lab Panels</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {labTests.map((t) => (
          <TestCard key={t.title} logoSrc={t.logo} title={t.title} description={t.desc} href={t.link} price={t.price} />
        ))}
      </div>
    </DashboardShell>
  );
} 