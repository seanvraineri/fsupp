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
    </DashboardShell>
  );
} 