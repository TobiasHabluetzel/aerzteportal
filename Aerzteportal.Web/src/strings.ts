// Minimal German-only string bag for Ärzteportal. Keep what Layout needs.

const DE: Record<string, string> = {
  back: 'Zurück',
  poweredBy: 'Powered by Eggselence',
}

export function t(key: keyof typeof DE): string {
  return DE[key] ?? key
}
