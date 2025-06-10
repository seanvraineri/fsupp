import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get genetic data count and details
    const { data: geneticData, error: geneticError } = await supabase
      .from('genetic_data')
      .select('snp_count, snp_data, source_company, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (geneticError) {
      console.error('Error fetching genetic data:', geneticError);
    }

    // Get biomarker data count and details  
    const { data: labData, error: labError } = await supabase
      .from('lab_data')
      .select('biomarker_count, biomarker_data, lab_name, test_date, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (labError) {
      console.error('Error fetching lab data:', labError);
    }

    // Calculate total SNPs and biomarkers
    let totalSnps = 0;
    let totalBiomarkers = 0;
    let uniqueGenes = new Set();
    let uniqueBiomarkers = new Set();

    // Process genetic data
    if (geneticData && geneticData.length > 0) {
      geneticData.forEach(row => {
        totalSnps += row.snp_count || 0;
        if (row.snp_data && typeof row.snp_data === 'object') {
          Object.keys(row.snp_data).forEach(rsid => {
            // Map rsID to gene
            const geneMap: { [key: string]: string } = {
              'rs1801133': 'MTHFR', 'rs1801131': 'MTHFR', 'rs4680': 'COMT',
              'rs2228570': 'VDR', 'rs731236': 'VDR', 'rs429358': 'APOE', 'rs7412': 'APOE'
            };
            const gene = geneMap[rsid] || 'Other';
            uniqueGenes.add(gene);
          });
        }
      });
    }

    // Process biomarker data
    if (labData && labData.length > 0) {
      labData.forEach(row => {
        totalBiomarkers += row.biomarker_count || 0;
        if (row.biomarker_data && typeof row.biomarker_data === 'object') {
          Object.keys(row.biomarker_data).forEach(biomarker => {
            uniqueBiomarkers.add(biomarker);
          });
        }
      });
    }

    // Health systems analysis
    const systems = [
      { key: 'methylation', name: 'Methylation', status: uniqueGenes.has('MTHFR') || uniqueGenes.has('COMT') ? 'amber' : 'normal' },
      { key: 'cardiovascular', name: 'Cardiovascular', status: uniqueGenes.has('APOE') || uniqueBiomarkers.has('cholesterol') ? 'green' : 'normal' },
      { key: 'vitamins', name: 'Vitamins', status: uniqueGenes.has('VDR') || uniqueBiomarkers.has('vitamin_d') ? 'green' : 'normal' },
      { key: 'detox', name: 'Detoxification', status: 'normal' },
      { key: 'inflammation', name: 'Inflammation', status: uniqueBiomarkers.has('crp') ? 'green' : 'normal' }
    ].filter(system => system.status !== 'normal');

    const response = {
      genesAnalyzed: uniqueGenes.size,
      biomarkersAnalyzed: uniqueBiomarkers.size,
      totalSnps,
      totalBiomarkers,
      systems,
      lastUpdated: geneticData?.[0]?.created_at || labData?.[0]?.created_at || null,
      sources: {
        genetic: geneticData?.map(d => d.source_company).filter(Boolean) || [],
        lab: labData?.map(d => d.lab_name).filter(Boolean) || []
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 