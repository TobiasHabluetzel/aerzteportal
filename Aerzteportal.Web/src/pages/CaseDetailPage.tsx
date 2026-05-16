import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { getCase, type CaseDetail } from '../api/cases'

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('de-DE') } catch { return iso }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl shadow-sm px-6 py-5">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-700">{children}</p>
    </div>
  )
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [c, setC] = useState<CaseDetail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getCase(id)
      .then(setC)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed'))
  }, [id])

  return (
    <Layout wide showBack onBack={() => navigate('/cases')}>
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          Fall konnte nicht geladen werden: {error}
        </div>
      )}

      {!c && !error && <p className="text-sm text-gray-400">Lade Fall…</p>}

      {c && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fallnr. {c.number}</p>
                <h1 className="text-xl font-bold text-gray-800 mt-0.5">
                  {c.claimant?.client?.name ?? 'Patient unbekannt'}
                </h1>
              </div>
              {c.phase?.name && (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-gray-100 text-gray-700">
                  {c.phase.name}
                </span>
              )}
            </div>
          </div>

          {/* Initial data */}
          <Section title="Falldaten">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
              <Field label="Patient">{c.claimant?.client?.name ?? '—'}</Field>
              <Field label="Geburtsdatum">{formatDate(c.claimant?.client?.dateOfBirth)}</Field>
              <Field label="Schadensdatum">{formatDate(c.incidentOn)}</Field>
              <Field label="Land">{c.incidentLocation?.country?.name ?? '—'}</Field>
              <Field label="Schadensursache">{c.coverCause?.name ?? '—'}</Field>
              <Field label="Produkt">{c.policy?.lastActiveSituation?.product?.displayName ?? c.policy?.displayNumber ?? '—'}</Field>
            </div>
            {c.diagnoses && c.diagnoses.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-1">Diagnosen</p>
                <ul className="text-sm text-gray-700 space-y-0.5">
                  {c.diagnoses.map(d => (
                    <li key={d.id}>
                      {d.code && <span className="font-mono text-xs text-gray-500 mr-2">{d.code}</span>}
                      {d.trimmedName ?? '—'}
                      {d.isPrimary && <span className="ml-2 text-xs text-gray-400">(primär)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          {/* Documents */}
          <Section title="Dokumente">
            {!c.communications || c.communications.length === 0 ? (
              <p className="text-sm text-gray-500">Keine Dokumente für das Ärzteportal hinterlegt.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {c.communications.map(doc => (
                  <li key={String(doc.id)} className="py-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-700">{doc.subject ?? '(ohne Betreff)'}</span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-brand-red hover:underline"
                      onClick={() => alert('Download wird im nächsten Schritt aktiviert.')}
                    >
                      Herunterladen
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Tasks */}
          <Section title="Aufgaben">
            {!c.tasks || c.tasks.length === 0 ? (
              <p className="text-sm text-gray-500">Aktuell sind keine Aufgaben offen.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {c.tasks.map(task => (
                  <li key={String(task.id)} className="py-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-700">{task.name ?? `Aufgabe ${task.id}`}</span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-brand-red hover:underline"
                      onClick={() => alert('Fragebogen wird im nächsten Schritt aktiviert.')}
                    >
                      Bearbeiten
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Upload placeholder */}
          <Section title="Dokumente hochladen">
            <p className="text-sm text-gray-500">Upload wird im nächsten Schritt aktiviert.</p>
          </Section>
        </div>
      )}
    </Layout>
  )
}
