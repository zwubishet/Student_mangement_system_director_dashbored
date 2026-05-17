import * as XLSX from 'xlsx';
import { parseCsvToRows } from './csvParse.js';

/** Parse CSV or Excel file into row objects (header row required). */
export async function parseSpreadsheetFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) {
    return parseCsvToRows(await file.text());
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    return rows.map((row) => {
      const out = {};
      Object.entries(row).forEach(([k, v]) => {
        const key = String(k).toLowerCase().replace(/\s+/g, '_');
        if (v !== '' && v != null) out[key] = String(v).trim();
      });
      return out;
    });
  }
  throw new Error('Unsupported file type. Use .csv, .xlsx, or .xls');
}
