import { useEffect } from 'react'

interface Props {
  fileId: string
  filename?: string | null
  contentType?: string | null
  onClose: () => void
}

export default function DocumentViewer({ fileId, filename, contentType, onClose }: Props) {
  // ESC closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const url = `/api/files/${encodeURIComponent(fileId)}`
  const isImage = (contentType ?? '').startsWith('image/')
  const isPdf = contentType === 'application/pdf' || (filename ?? '').toLowerCase().endsWith('.pdf')

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex flex-col"
      onClick={onClose}
    >
      <header className="flex items-center justify-between px-5 py-3 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium truncate">{filename ?? 'Dokument'}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs underline text-white/70 hover:text-white"
          >
            Herunterladen
          </a>
        </div>
        <button
          onClick={onClose}
          aria-label="Schließen"
          className="text-white/80 hover:text-white p-1 -mr-1"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </header>

      <div
        className="flex-1 flex items-center justify-center px-6 pb-6 overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {isImage && (
          <img src={url} alt={filename ?? ''} className="max-w-full max-h-full object-contain rounded" />
        )}
        {!isImage && isPdf && (
          <iframe
            src={url}
            title={filename ?? 'Dokument'}
            className="w-full h-full bg-white rounded"
          />
        )}
        {!isImage && !isPdf && (
          <div className="text-center text-white/80 text-sm">
            <p>Dieses Format kann nicht direkt angezeigt werden.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 px-4 py-2 rounded-full bg-white text-gray-800 text-sm font-semibold"
            >
              In neuem Tab öffnen
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
