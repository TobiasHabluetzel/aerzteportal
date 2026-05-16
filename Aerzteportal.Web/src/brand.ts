// Brand + language switch driven by ?brand= URL param.
// sparkasse (default) → German; bryte → English.

export type BrandId = 'sparkasse' | 'bryte'
export type Lang = 'de' | 'en'

export interface Brand {
  id: BrandId
  name: string
  logoLetter: string
  lang: Lang
  countryName: string
  emergencyLabel: string
  emergencyPhone: string
  emergencyEmail?: string
  footer: { label: string; href: string }[]
  bankPlaceholders: {
    iban: string
    bic: string
    geldinstitut: string
  }
}

const BRANDS: Record<BrandId, Brand> = {
  sparkasse: {
    id: 'sparkasse',
    name: 'S-Reiseschutz',
    logoLetter: 'S',
    lang: 'de',
    countryName: 'Deutschland',
    emergencyLabel: 'Notfall im Ausland',
    emergencyPhone: '+49 211 536 – 3888',
    footer: [
      { label: 'Impressum', href: 'https://s-reiseschutz.de/impressum' },
      { label: 'Datenschutz', href: 'https://s-reiseschutz.de/datenschutz' },
      { label: 'FAQ', href: 'https://s-reiseschutz.de/faq' },
    ],
    bankPlaceholders: {
      iban: 'DE00 0000 0000 0000 0000 00',
      bic: 'z. B. BELADEBEXXX',
      geldinstitut: 'z. B. Sparkasse Berlin, 10115 Berlin',
    },
  },
  bryte: {
    id: 'bryte',
    name: 'Bryte Travel',
    logoLetter: 'B',
    lang: 'en',
    countryName: 'South Africa',
    emergencyLabel: 'Travel Customer Care',
    emergencyPhone: '0860 737 775',
    emergencyEmail: 'travelcare@brytesa.com',
    footer: [
      { label: 'Legal', href: 'https://www.brytesa.com/legal/access-to-information/' },
      { label: 'Privacy', href: 'https://www.brytesa.com/pdf/Bryte_privacy_statement.pdf' },
      { label: 'FAQ', href: '#' },
    ],
    bankPlaceholders: {
      iban: 'e.g. 12345678',
      bic: 'e.g. FIRNZAJJ',
      geldinstitut: 'e.g. FNB, Sandton, Johannesburg',
    },
  },
}

function readBrandId(): BrandId {
  if (typeof window === 'undefined') return 'sparkasse'
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('brand')?.toLowerCase()
  if (fromUrl === 'bryte' || fromUrl === 'sparkasse') {
    sessionStorage.setItem('brand', fromUrl)
    return fromUrl
  }
  const stored = sessionStorage.getItem('brand')
  if (stored === 'bryte') return 'bryte'
  return 'sparkasse'
}

let _brand: Brand | null = null
export function getBrand(): Brand {
  if (!_brand) _brand = BRANDS[readBrandId()]
  return _brand
}

// Apply brand to <html> so CSS can swap variables, and set <title>.
export function applyBrand() {
  const brand = getBrand()
  document.documentElement.dataset.brand = brand.id
  document.documentElement.lang = brand.lang
  document.title =
    brand.lang === 'en'
      ? `${brand.name} – File a claim`
      : `${brand.name} – Schaden melden`
}
