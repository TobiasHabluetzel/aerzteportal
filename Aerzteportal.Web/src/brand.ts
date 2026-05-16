// Single-tenant Ärzteportal brand. No URL-driven brand switch here — this
// app serves one customer; the multi-brand machinery from the deutsche
// shell isn't needed.

export interface Brand {
  name: string
  logoLetter: string
  footer: { label: string; href: string }[]
}

const BRAND: Brand = {
  name: 'Ärzteportal',
  logoLetter: 'Ä',
  footer: [
    { label: 'Impressum', href: '#' },
    { label: 'Datenschutz', href: '#' },
  ],
}

export function getBrand(): Brand {
  return BRAND
}

export function applyBrand() {
  document.documentElement.lang = 'de'
  document.title = `${BRAND.name} – Anmelden`
}
