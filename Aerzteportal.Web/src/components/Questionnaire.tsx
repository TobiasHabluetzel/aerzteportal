import { useMemo, useState } from 'react'
import type { AnswerInput, QuestionnaireAnswer, QuestionnaireElement, TaskItem } from '../api/cases'

interface Props {
  task: TaskItem
  onSubmit: (answers: AnswerInput[], complete: boolean) => Promise<void>
}

type Draft = Record<string, AnswerInput>

function seedDraftFromAnswers(answers: QuestionnaireAnswer[]): Draft {
  const out: Draft = {}
  for (const a of answers) {
    switch (a.__typename) {
      case 'DateTimeQuestionnaireAnswer':
        out[a.questionId] = { questionId: a.questionId, type: 'date', date: a.dateTimeValue }
        break
      case 'ChoiceQuestionnaireAnswer':
        out[a.questionId] = { questionId: a.questionId, type: 'choice', choices: a.choiceValue ?? [] }
        break
      case 'TextQuestionnaireAnswer':
        out[a.questionId] = { questionId: a.questionId, type: 'text', stringValue: a.textValue }
        break
      case 'BoolQuestionnaireAnswer':
        out[a.questionId] = { questionId: a.questionId, type: 'bool', bool: a.boolValue }
        break
    }
  }
  return out
}

export default function Questionnaire({ task, onSubmit }: Props) {
  const q = task.questionnaire
  const [draft, setDraft] = useState<Draft>(() => seedDraftFromAnswers(q?.answers ?? []))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const visibleSections = useMemo(
    () => new Set(q?.visibleSections ?? []),
    [q?.visibleSections],
  )
  const visibleQuestions = useMemo(
    () => new Set(q?.visibleQuestions ?? []),
    [q?.visibleQuestions],
  )

  if (!q) return <p className="text-sm text-gray-500">Kein Fragebogen für diese Aufgabe.</p>

  function update(answer: AnswerInput) {
    setDraft(prev => ({ ...prev, [answer.questionId]: answer }))
  }

  async function save(complete: boolean) {
    setError('')
    setSaving(true)
    try {
      await onSubmit(Object.values(draft), complete)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {q.definition.sections
        .filter(s => visibleSections.size === 0 || visibleSections.has(s.key))
        .map(section => (
          <div key={section.key} className="space-y-3">
            <div className="space-y-3">
              {section.elements
                .filter(el => visibleQuestions.size === 0 || visibleQuestions.has(el.key))
                .map(el => (
                  <Field key={el.key} element={el} value={draft[el.key]} onChange={update} />
                ))}
            </div>
          </div>
        ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={saving || task.isCompleted}
          className="border border-gray-200 text-gray-700 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          {saving ? 'Speichern…' : 'Speichern'}
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving || task.isCompleted}
          className="bg-brand-red text-white rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          {saving ? 'Abschließen…' : 'Abschließen'}
        </button>
        {task.isCompleted && (
          <span className="text-xs text-gray-400 ml-2">Aufgabe bereits abgeschlossen.</span>
        )}
      </div>
    </div>
  )
}

function Field({ element, value, onChange }: {
  element: QuestionnaireElement
  value?: AnswerInput
  onChange: (a: AnswerInput) => void
}) {
  switch (element.__typename) {
    case 'QuestionnaireTextQuestion':
      return (
        <Labeled label={element.name}>
          <textarea
            value={value?.stringValue ?? ''}
            onChange={e => onChange({ questionId: element.key, type: 'text', stringValue: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-red"
          />
        </Labeled>
      )
    case 'QuestionnaireDateTimeQuestion':
      return (
        <Labeled label={element.name}>
          <input
            type={element.useTime ? 'datetime-local' : 'date'}
            value={value?.date ?? ''}
            onChange={e => onChange({ questionId: element.key, type: 'date', date: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-red"
          />
        </Labeled>
      )
    case 'QuestionnaireBooleanQuestion':
      return (
        <Labeled label={element.name}>
          <div className="flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name={`bool-${element.key}`}
                checked={value?.bool === true}
                onChange={() => onChange({ questionId: element.key, type: 'bool', bool: true })}
              />
              Ja
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name={`bool-${element.key}`}
                checked={value?.bool === false}
                onChange={() => onChange({ questionId: element.key, type: 'bool', bool: false })}
              />
              Nein
            </label>
          </div>
        </Labeled>
      )
    case 'QuestionnaireChoiceQuestion': {
      const selected = new Set(value?.choices ?? [])
      const multi = element.canSelectMultiple === true
      return (
        <Labeled label={element.name}>
          <div className="space-y-1.5">
            {element.options.map(opt => (
              <label key={opt.key} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type={multi ? 'checkbox' : 'radio'}
                  name={`choice-${element.key}`}
                  checked={selected.has(opt.key)}
                  onChange={() => {
                    let next: string[]
                    if (multi) {
                      next = selected.has(opt.key)
                        ? [...selected].filter(k => k !== opt.key)
                        : [...selected, opt.key]
                    } else {
                      next = [opt.key]
                    }
                    onChange({ questionId: element.key, type: 'choice', choices: next })
                  }}
                />
                {opt.text}
              </label>
            ))}
          </div>
        </Labeled>
      )
    }
  }
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
