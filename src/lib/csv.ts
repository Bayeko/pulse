import Papa from 'papaparse';

export function serializeToCsv<T extends Record<string, unknown>>(items: T[]): string {
  if (!items || items.length === 0) return '';
  return Papa.unparse(items);
}
