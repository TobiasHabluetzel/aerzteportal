import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Questionnaire from '../components/Questionnaire'
import DocumentViewer from '../components/DocumentViewer'
import { getCase, submitTaskAnswers, uploadFiles, type CaseDetail, type CommunicationFile, type TaskItem } from '../api/cases'

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

function taskLabel(t: TaskItem): string {
  // NIS's Task type doesn't carry a display name; use the first section's
  // key as a friendly-ish label, falling back to the task id.
  const firstSection = t.questionnaire?.definition.sections[0]?.key
  return firstSection ?? `Aufgabe ${t.id}`
}

function TaskBlock({ task, caseId, onChange }: { task: TaskItem; caseId: string; onChange: () => void }) {
  const [open, setOpen] = useState(!task.isCompleted)
  return (
    <div className="border border-gray-100 rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <span className="text-sm font-medium text-gray-700">{taskLabel(task)}</span>
        <span className="flex items-center gap-2">
          {task.isCompleted && <span className="text-xs text-green-700 bg-green-50 rounded px-2 py-0.5">Abgeschlossen</span>}
          <span className="text-xs text-gray-400">{open ? 'Schließen' : 'Öffnen'}</span>
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/40">
          <Questionnaire
            task={task}
            onSubmit={async (answers, complete) => {
              await submitTaskAnswers(caseId, task.id, answers, complete)
              onChange()
            }}
          />
        </div>
      )}
    </div>
  )
}

function UploadBox({ caseId, onUploaded }: { caseId: string; onUploaded: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    e.target.value = ''
    setError('')
    setBusy(true)
    try {
      await uploadFiles(caseId, files)
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold cursor-pointer ${busy ? 'bg-gray-200 text-gray-500' : 'bg-brand-red text-white hover:opacity-90'}`}>
        {busy ? 'Hochladen…' : 'Dateien auswählen'}
        <input type="file" multiple onChange={pick} disabled={busy} className="hidden" />
      </label>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [c, setC] = useState<CaseDetail | null>(null)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [viewing, setViewing] = useState<CommunicationFile | null>(null)

  useEffect(() => {
    if (!id) return
    getCase(id)
      .then(setC)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed'))
  }, [id, reloadKey])

  const reload = () => setReloadKey(k => k + 1)

  return (
    <Layout wide showBack onBack={() => navigate('/cases')}>
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          Fall konnte nicht geladen werden: {error}
        </div>
      )}

      {!c && !error && <p className="text-sm text-gray-400">Lade Fall…</p>}

      {c && id && (
        <div className="space-y-4">
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

          <Section title="Dokumente">
            {!c.communications || c.communications.length === 0 ? (
              <p className="text-sm text-gray-500">Keine Dokumente für das Ärzteportal hinterlegt.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {c.communications.flatMap(doc => {
                  const files = doc.files ?? []
                  if (files.length === 0) {
                    return [(
                      <li key={String(doc.id)} className="py-2 flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-700">{doc.subject ?? '(ohne Betreff)'}</span>
                        <span className="text-xs text-gray-400">keine Datei</span>
                      </li>
                    )]
                  }
                  return files.map(f => (
                    <li key={`${doc.id}-${f.id}`} className="py-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setViewing(f)}
                        className="text-left text-sm text-gray-700 truncate hover:text-brand-red"
                      >
                        {f.name ?? doc.subject ?? '(ohne Betreff)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewing(f)}
                        className="text-xs font-semibold text-brand-red hover:underline"
                      >
                        Ansehen
                      </button>
                    </li>
                  ))
                })}
              </ul>
            )}
          </Section>

          <Section title="Aufgaben">
            {!c.tasks || c.tasks.length === 0 ? (
              <p className="text-sm text-gray-500">Aktuell sind keine Aufgaben offen.</p>
            ) : (
              <div className="space-y-2">
                {c.tasks.map(task => (
                  <TaskBlock key={task.id} task={task} caseId={id} onChange={reload} />
                ))}
              </div>
            )}
          </Section>

          <Section title="Dokumente hochladen">
            <UploadBox caseId={id} onUploaded={reload} />
          </Section>
        </div>
      )}

      {viewing && (
        <DocumentViewer
          fileId={viewing.id}
          filename={viewing.name}
          contentType={viewing.contentType}
          onClose={() => setViewing(null)}
        />
      )}
    </Layout>
  )
}
