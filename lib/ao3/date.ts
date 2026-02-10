const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04',
  May: '05', Jun: '06', Jul: '07', Aug: '08',
  Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}

/** Convert AO3's "DD Mon YYYY" format to "YYYY-MM-DD". Returns raw string if it doesn't match. */
export function toISODate(raw: string): string {
  const m = raw.match(/^(\d{2})\s+(\w{3})\s+(\d{4})$/)
  if (!m) return raw
  return `${m[3]}-${MONTHS[m[2]] ?? '01'}-${m[1]}`
}
