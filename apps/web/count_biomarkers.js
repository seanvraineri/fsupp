// Count biomarkers in all databases

console.log("🧪 Counting Biomarker Database Coverage");

try {
  const { BIOMARKER_DATABASE } = await import('./supabase/functions/generate_analysis_v2/lib/biomarker_database.ts');
  console.log('Core biomarkers:', Object.keys(BIOMARKER_DATABASE).length);
  
  try {
    const { EXTENDED_BIOMARKER_DATABASE } = await import('./supabase/functions/generate_analysis_v2/lib/extended_biomarker_database.ts');
    console.log('Extended biomarkers:', Object.keys(EXTENDED_BIOMARKER_DATABASE).length);
    console.log('Total biomarkers:', Object.keys(BIOMARKER_DATABASE).length + Object.keys(EXTENDED_BIOMARKER_DATABASE).length);
  } catch (err) {
    console.log('Extended biomarkers: Error loading -', err.message);
    console.log('Estimate based on file: 15+ biomarkers');
  }
} catch (err) {
  console.log('Error loading biomarker databases:', err.message);
} 