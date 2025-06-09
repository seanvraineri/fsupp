// detectFileType.ts - v1 2025-06-03
// Lightweight helper to determine uploaded file format (txt/csv/pdf) and extract textContent when possible.

export type FileFormat = 'txt' | 'csv' | 'pdf' | 'zip';

export interface DetectedFormat {
  format: FileFormat;
  textContent: string; // best-effort UTF-8 text extracted (pdf may be empty)
}



/**
 * Advanced file type detector with magic bytes + extension heuristic.
 * Supports PDF, ZIP, CSV, TXT formats.
 */
export async function detectFileType(bytes: ArrayBuffer, fileName: string): Promise<DetectedFormat> {
  const uint8 = new Uint8Array(bytes);
  const ext = fileName.toLowerCase().split('.').pop() ?? '';

  // PDF magic bytes: 25 50 44 46 2D ( "%PDF-" )
  const isPdf = uint8[0] === 0x25 && uint8[1] === 0x50 && uint8[2] === 0x44 && uint8[3] === 0x46;
  if (isPdf || ext === 'pdf') {
    console.log('Processing PDF file with GEMINI 2.0 FLASH...');
    
    try {
      // USE GEMINI 2.0 FLASH FOR SUPERIOR PDF PARSING
      const { geminiParseGeneticPdf, geminiParseLabPdf } = await import('./ai.ts');
      
      console.log('Trying Gemini genetic extraction...');
      const [geneticResult, labResult] = await Promise.all([
        geminiParseGeneticPdf(bytes).catch(err => {
          console.log('Gemini genetic extraction failed:', err.message);
          return {};
        }),
        geminiParseLabPdf(bytes).catch(err => {
          console.log('Gemini lab extraction failed:', err.message);
          return {};
        })
      ]);
      
      // Convert results to structured text format for downstream processing
      let extractedText = '';
      
      if (Object.keys(geneticResult).length > 0) {
        extractedText += '=== GENETIC DATA ===\n';
        for (const [rsid, genotype] of Object.entries(geneticResult)) {
          extractedText += `${rsid}\t${genotype}\n`;
        }
        console.log(`🧬 Gemini extracted ${Object.keys(geneticResult).length} genetic variants`);
      }
      
      if (Object.keys(labResult).length > 0) {
        extractedText += '\n=== LAB DATA ===\n';
        for (const [biomarker, value] of Object.entries(labResult)) {
          extractedText += `${biomarker}\t${value}\n`;
        }
        console.log(`📊 Gemini extracted ${Object.keys(labResult).length} biomarkers`);
      }
      
      if (!extractedText) {
        console.warn('Gemini found no genetic or lab data in PDF');
        return { format: 'pdf', textContent: '' };
      }
      
      console.log('Final Gemini extracted text length:', extractedText.length);
      console.log('Sample Gemini extracted text:', extractedText.slice(0, 500));
      
      return { format: 'pdf', textContent: extractedText };
      
    } catch (error) {
      console.error('Gemini PDF processing failed:', error);
      return { format: 'pdf', textContent: '' };
    }
  }

  // ZIP magic bytes: 50 4B ( "PK" )
  const isZip = uint8[0] === 0x50 && uint8[1] === 0x4B;
  if (isZip || ext === 'zip') {
    return { format: 'zip', textContent: '' };
  }

  // Try to decode as UTF-8 text
  const text = new TextDecoder().decode(bytes);
  
  // Enhanced CSV detection: look for structured data patterns
  const lines = text.split('\n').slice(0, 10); // Check first 10 lines
  const commaRatio = (text.match(/,/g) ?? []).length / (text.length || 1);
  const hasHeaders = lines[0] && lines[0].includes(',') && lines[1] && lines[1].includes(',');
  const isStructured = commaRatio > 0.01 || hasHeaders || ext === 'csv';
  
  const format: FileFormat = isStructured ? 'csv' : 'txt';
  return { format, textContent: text };
} 
