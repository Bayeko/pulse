import { describe, it, expect } from 'vitest';
import Papa from 'papaparse';
import { serializeToCsv } from './csv';

describe('serializeToCsv', () => {
  it('round-trips data with commas, quotes, and line breaks', () => {
    const data = [
      {
        id: 1,
        text: 'Hello, world',
        quote: 'He said "Hi"',
        multiline: 'Line1\nLine2',
      },
    ];
    const csv = serializeToCsv(data);
    const parsed = Papa.parse(csv, { header: true, dynamicTyping: true }).data as any[];
    expect(parsed[0]).toEqual({
      id: 1,
      text: 'Hello, world',
      quote: 'He said "Hi"',
      multiline: 'Line1\nLine2',
    });
  });
});
