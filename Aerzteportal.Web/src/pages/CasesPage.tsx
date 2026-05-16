import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { listCases, type CaseItem } from '../api/cases'

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('de-DE') } catch { return iso }
}

function PhasePill({ name }: { name?: string | null }) {
  if (!name) return <span className="text-xs text-gray-400">—</span>
  return (
    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
      {name}
    </span>
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
    <Layout wide>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Willkommen, {greeting}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {cases === null ? 'Lade Fälle…' : `${total} offene Fälle`}
          </p>
        </div>
        <button onClick={() => logout()} className="text-xs text-gray-400 hover:text-gray-700 underline">
          Abmelden
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
          Fälle konnten nicht geladen werden: {error}
        </div>
      )}

      {cases !== null && cases.length === 0 && !error && (
        <div className="bg-white rounded-xl shadow-sm px-5 py-6 text-sm text-gray-500 text-center">
          Aktuell sind Ihnen keine offenen Fälle zugewiesen.
        </div>
      )}

      {cases && cases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Fallnr.</th>
                <th className="text-left px-4 py-3 font-medium">Patient</th>
                <th className="text-left px-4 py-3 font-medium">Produkt</th>
                <th className="text-left px-4 py-3 font-medium">Phase</th>
                <th className="text-left px-4 py-3 font-medium">Schadensdatum</th>
                <th className="text-left px-4 py-3 font-medium">Land</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cases.map(c => {
                const claimant = c.claimant?.client?.name ?? '—'
                const product = c.policy?.lastActiveSituation?.product?.displayName
                  ?? c.policy?.displayNumber ?? '—'
                const country = c.incidentLocation?.country?.name ?? '—'
                return (
                  <tr
                    key={c.id}
                    onClick={() => { window.location.href = `/cases/${encodeURIComponent(c.id)}` }}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.number}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{claimant}</td>
                    <td className="px-4 py-3 text-gray-700">{product}</td>
                    <td className="px-4 py-3"><PhasePill name={c.phase?.name} /></td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(c.incidentOn ?? c.createdOn)}</td>
                    <td className="px-4 py-3 text-gray-700">{country}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
