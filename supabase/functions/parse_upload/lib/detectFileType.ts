// detectFileType.ts - v1 2025-06-03
// Lightweight helper to determine uploaded file format (txt/csv/pdf) and extract textContent when possible.

export type FileFormat = 'txt' | 'csv' | 'pdf';

export interface DetectedFormat {
  format: FileFormat;
  textContent: string; // best-effort UTF-8 text extracted (pdf may be empty)
}

/**
 * Naïve detector using magic bytes + extension heuristic.
 * For PDFs we just mark format = 'pdf' and leave textContent empty (to be handled by lab.ts).
 */
export async function detectFileType(bytes: ArrayBuffer, fileName: string): Promise<DetectedFormat> {
  const uint8 = new Uint8Array(bytes);
  const ext = fileName.toLowerCase().split('.').pop() ?? '';

  // PDF magic bytes: 25 50 44 46 2D ( "%PDF-" )
  const isPdf = uint8[0] === 0x25 && uint8[1] === 0x50 && uint8[2] === 0x44 && uint8[3] === 0x46;
  if (isPdf || ext === 'pdf') {
    return { format: 'pdf', textContent: '' };
  }

  // Try to decode as UTF-8 text
  const text = new TextDecoder().decode(bytes);
  // Very naive CSV detection: look for commas and line breaks
  const commaRatio = (text.match(/,/g) ?? []).length / (text.length || 1);
  const format: FileFormat = commaRatio > 0.01 || ext === 'csv' ? 'csv' : 'txt';
  return { format, textContent: text };
} 
