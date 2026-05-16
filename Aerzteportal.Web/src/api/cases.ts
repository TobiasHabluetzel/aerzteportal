const BASE = '/api/cases'

export interface Phase {
  id: string
  name: string
}

export interface Diagnosis {
  id: string
  isPrimary: boolean
  trimmedName?: string | null
  code?: string | null
}

export interface CaseItem {
  id: string
  number: string
  status: string
  createdOn?: string | null
  incidentOn?: string | null
  isDraft: boolean
  isVip: boolean
  phase?: Phase | null
  organisation?: { id: string; code?: string | null; name?: string | null } | null
  claimant?: { client?: { id: string; name?: string | null } | null } | null
  incidentLocation?: { country?: { id: string; name?: string | null } | null } | null
  coverCause?: { id: string; code?: string | null; name?: string | null } | null
  coverage?: { id: string; name?: string | null } | null
  diagnoses?: Diagnosis[] | null
  policy?: {
    id: string
    displayNumber?: string | null
    period?: { start?: string | null; end?: string | null } | null
    lastActiveSituation?: { product?: { displayName?: string | null } | null } | null
  } | null
}

export interface CasesPage {
  items: CaseItem[]
  totalCount: number
}

export async function listCases(status: string = 'OPEN'): Promise<CasesPage> {
  const res = await fetch(`${BASE}?status=${encodeURIComponent(status)}`)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export interface CommunicationFile {
  id: string
  name?: string | null
  contentType?: string | null
}

export interface CommunicationItem {
  __typename?: string
  id: string | number
  subject?: string | null
  tags?: { name: string }[] | null
  files?: CommunicationFile[] | null
}

export type QuestionnaireElement =
  | { __typename: 'QuestionnaireDateTimeQuestion'; key: string; name: string; useTime?: boolean }
  | { __typename: 'QuestionnaireChoiceQuestion'; key: string; name: string; canSelectMultiple?: boolean; options: { key: string; text: string }[] }
  | { __typename: 'QuestionnaireTextQuestion'; key: string; name: string }
  | { __typename: 'QuestionnaireBooleanQuestion'; key: string; name: string }

export type QuestionnaireAnswer =
  | { __typename: 'DateTimeQuestionnaireAnswer'; questionId: string; dateTimeValue: string }
  | { __typename: 'ChoiceQuestionnaireAnswer'; questionId: string; choiceValue: string[] }
  | { __typename: 'TextQuestionnaireAnswer'; questionId: string; textValue: string }
  | { __typename: 'BoolQuestionnaireAnswer'; questionId: string; boolValue: boolean }

export interface TaskItem {
  id: number
  isCompleted: boolean
  tags?: { name: string }[] | null
  questionnaire?: {
    visibleSections?: string[] | null
    visibleQuestions?: string[] | null
    unansweredQuestions?: string[] | null
    answers: QuestionnaireAnswer[]
    definition: {
      sections: { key: string; elements: QuestionnaireElement[] }[]
    }
  } | null
}

// What we POST back to /api/cases/{caseId}/tasks/{taskId}/answers
export interface AnswerInput {
  questionId: string
  type: 'date' | 'choice' | 'text' | 'bool'
  date?: string
  choices?: string[]
  stringValue?: string
  bool?: boolean
}

export async function submitTaskAnswers(
  caseId: string,
  taskId: number,
  answers: AnswerInput[],
  completeTask: boolean,
): Promise<void> {
  const res = await fetch(`/api/cases/${encodeURIComponent(caseId)}/tasks/${taskId}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, completeTask }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
}

export async function uploadFiles(caseId: string, files: File[]): Promise<void> {
  const form = new FormData()
  for (const f of files) form.append('files', f, f.name)
  const res = await fetch(`/api/cases/${encodeURIComponent(caseId)}/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(`${res.status}`)
}

export interface CaseDetail {
  id: string
  number: string
  status: string
  createdOn?: string | null
  incidentOn?: string | null
  phase?: { id: string; name?: string | null } | null
  claimant?: {
    client?: {
      id: string
      name?: string | null
      dateOfBirth?: string | null
    } | null
  } | null
  incidentLocation?: { country?: { id: string; name?: string | null } | null } | null
  coverCause?: { id: string; code?: string | null; name?: string | null } | null
  diagnoses?: { id: string; isPrimary: boolean; trimmedName?: string | null; code?: string | null }[] | null
  policy?: {
    id: string
    displayNumber?: string | null
    period?: { start?: string | null; end?: string | null } | null
    lastActiveSituation?: { product?: { displayName?: string | null } | null } | null
  } | null
  communications?: CommunicationItem[]
  tasks?: TaskItem[]
}

export async function getCase(id: string): Promise<CaseDetail> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}
