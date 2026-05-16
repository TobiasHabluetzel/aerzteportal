import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { listCases, type CaseItem } from '../api/cases'

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('de-DE') } catch { return iso }
}

function CaseRow({ c }: { c: CaseItem }) {
  const claimant = c.claimant?.client?.name ?? '—'
  const country = c.incidentLocation?.country?.name ?? '—'
  const product = c.policy?.lastActiveSituation?.product?.displayName
    ?? c.policy?.displayNumber ?? '—'
  return (
    <a
      href={`/cases/${encodeURIComponent(c.id)}`}
      className="block bg-white rounded-2xl shadow-sm px-5 py-4 hover:shadow transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-400 tracking-wider">{c.number}</p>
          <p className="text-base font-semibold text-gray-800 mt-0.5 truncate">{claimant}</p>
          <p className="text-xs text-gray-500 mt-1">{product}</p>
        </div>
        <div className="text-right shrink-0">
          {c.phase?.name && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">{c.phase.name}</span>
          )}
          <p className="text-xs text-gray-400 mt-1">{formatDate(c.incidentOn ?? c.createdOn)}</p>
          <p className="text-xs text-gray-400">{country}</p>
        </div>
      </div>
    </a>
  )
}

export default function CasesPage() {
  const { user, logout } = useAuth()
  const [cases, setCases] = useState<CaseItem[] | null>(null)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    listCases('OPEN')
      .then(r => { setCases(r.items); setTotal(r.totalCount) })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed'))
  }, [])

  const greeting = user?.name ?? 'Doctor'

  return (
    <Layout>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Willkommen, {greeting}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {cases === null ? 'Lade Fälle…' : `${total} offene Fälle`}
          </p>
        </div>
        <button onClick={() => logout()} className="text-xs text-gray-400 hover:text-gray-700 underline">
          Abmelden
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600">
          Fälle konnten nicht geladen werden: {error}
        </div>
      )}

      {cases !== null && cases.length === 0 && !error && (
        <div className="bg-white rounded-2xl shadow-sm px-5 py-6 text-sm text-gray-500 text-center">
          Aktuell sind Ihnen keine offenen Fälle zugewiesen.
        </div>
      )}

      <div className="space-y-3">
        {cases?.map(c => <CaseRow key={c.id} c={c} />)}
      </div>
    </Layout>
  )
}
