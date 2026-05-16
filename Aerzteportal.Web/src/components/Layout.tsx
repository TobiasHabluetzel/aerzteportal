import { getBrand } from '../brand'
import { t } from '../strings'

interface LayoutProps {
  children: React.ReactNode
  showBack?: boolean
  onBack?: () => void
  wide?: boolean
}

export default function Layout({ children, showBack, onBack, wide }: LayoutProps) {
  const brand = getBrand()
  const innerWidth = wide ? 'max-w-5xl' : 'max-w-lg'
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-brand-red shadow-sm">
        <div className={`${innerWidth} mx-auto px-4 py-3 flex items-center gap-3`}>
          {showBack && (
            <button
              onClick={onBack}
              className="text-white/80 hover:text-white transition-colors p-1 -ml-1"
              aria-label={t('back')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-brand-red text-lg leading-none">
              {brand.logoLetter}
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">{brand.name}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={`flex-1 ${innerWidth} mx-auto w-full px-4 py-6`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className={`${innerWidth} mx-auto px-4 py-4 text-center text-xs text-gray-400 space-x-3`}>
          {brand.footer.map(link => (
            <a key={link.label} href={link.href} className="hover:text-gray-600" target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
          <span>{t('poweredBy')}</span>
        </div>
      </footer>
    </div>
  )
}
