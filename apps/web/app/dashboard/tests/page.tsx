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
          <p className="mb-4 leading-relaxed">Already invested in a genetic test or recent blood work?  Awesome—there&apos;s no need to buy another kit.  Just make sure your file checks the boxes below so our parser can crunch the numbers and turn them into precise dosages.</p>

          {/* Genetic checklist */}
          <div>
            <h3 className="font-semibold mb-2 text-primary-from">Genetic-file essentials</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code>.txt</code>, <code>.csv</code> or <code>.vcf</code> &nbsp;— raw data exports only (screenshots won&apos;t work).</li>
              <li>Contains the &quot;nutrition SNPs&quot; we rely on:<br/>
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

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Our uploader will automatically validate these requirements.  If something&apos;s missing you&apos;ll get an instant pop-up with what to fix.</p>

          <div className="pt-3 text-xs leading-snug text-gray-500 dark:text-gray-400">
            <h4 className="font-semibold mb-1">Why so strict?</h4>
            <p>Those SNPs control folate recycling, vitamin-D activation, lipid response and detox pathways—cornerstones of our dosing engine.  The lab markers let us avoid over-supplementing and fine-tune cofactors.  When they&apos;re absent we can still build a starter plan, but accuracy drops.</p>
          </div>
        </div>
      </details>

      {/* How to buy a kit section */}
      <details className="mt-6 rounded-lg border dark:border-gray-700 p-4">
        <summary className="font-medium cursor-pointer">🛒 Haven&apos;t bought a kit yet? Read this first</summary>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            There are hundreds of DNA and blood-test companies.  Here&apos;s what matters if you plan to use SupplementScribe:
          </p>

          <h3 className="font-semibold text-primary-from">For Genetic Tests</h3>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <strong>Raw-data download</strong> – the vendor must let you export a
              <code className="ml-1">.txt</code> or <code>.vcf</code> file. Dashboard-only views won&apos;t work.
            </li>
            <li><strong>CLIA or CAP certified</strong> – guarantees clinical-grade accuracy.</li>
            <li><strong>SNP coverage &gt; 600 k</strong> – ensures all nutrition SNPs (MTHFR, VDR, COMT, APOE...) are present. Whole-genome sequencing is even better.</li>
            <li><em>Value add from SS:</em> we translate those variants into doses, interactions and deficiency fixes.</li>
          </ul>

          <h3 className="font-semibold text-primary-from mt-4">For Blood Panels</h3>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Numeric PDF results</strong> – look for labs that email a downloadable report (not screenshots).</li>
            <li><strong>Include micronutrients</strong> – Vitamin D, Ferritin, Homocysteine, hs-CRP, HbA1c at minimum.</li>
            <li><em>Value add from SS:</em> we convert raw numbers into correction protocols and track adherence.</li>
          </ul>

          <p className="text-xs text-gray-500">Tip: if a vendor claims &quot;personalized supplement recommendations,&quot; make sure they still give raw downloads—otherwise you can&apos;t import the data anywhere else.</p>
        </div>
      </details>

      {/* Why testing matters */}
      <details className="mt-6 rounded-lg border dark:border-gray-700 p-4" open>
        <summary className="font-medium cursor-pointer">Why do these tests matter?</summary>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <p>
            Functional medicine starts with <strong>root-cause data</strong>.  Genes reveal the &quot;software&quot; you were born with—how you convert B-vitamins, clear histamine, transport minerals, detoxify hormones and drugs.  Labs reveal the real-time &quot;hardware status&quot;: chronic inflammation, depleted antioxidants, sluggish thyroid, sub-optimal lipids.
          </p>
          <p>
            When these two data streams are merged, we can answer questions like:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><em>&quot;Why do I get sick every winter even though I take vitamin C?&quot;</em> → Your VDR variants plus a chronically low 25-OH Vit-D level mean your immune signaling is underpowered.</li>
            <li><em>&quot;Why do statins wreck my joints?&quot;</em> → SLCO1B1 and CYP3A5 genotypes slow statin clearance; CoQ10 is tanked on your labs.  We lower the dose and add ubiquinol.</li>
            <li><em>&quot;Why can&apos;t I tolerate B-complex pills?&quot;</em> → MTHFR &amp; MTRR SNPs + high homocysteine signal that you need methyl-folate, not folic acid.</li>
            <li><em>&quot;Why am I still exhausted on thyroid meds?&quot;</em> → Selenium, zinc and ferritin are sub-optimal; we correct the co-factors so T4 can convert to active T3.</li>
          </ul>
          <p className="pt-2">
            In short, precise data lets SupplementScribe move you from generic internet advice to a <strong>clinically-defensible protocol</strong>—targeted nutrients, right doses, timed re-testing, and fewer &quot;try-this&quot; drug experiments.
          </p>
          <h3 className="font-semibold text-primary-from mt-4">What SupplementScribe does with the data</h3>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Auto-calculate <strong>genotype-specific doses</strong> (e.g., up-titrate methyl-folate, restrict iron for HFE variants).</li>
            <li>Flag <strong>drug–nutrient interactions</strong> based on liver-enzyme SNPs and your medication list.</li>
            <li>Prioritize nutrients that move lab markers into optimal—not just &quot;normal&quot;—ranges.</li>
            <li>Create a re-test calendar so you can objectively track progress every 3-6 months.</li>
          </ul>
        </div>
      </details>
    </DashboardShell>
  );
} 
