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

export interface CommunicationItem {
  id: string | number
  subject?: string | null
  tags?: { name: string }[] | null
}

export interface TaskItem {
  id: string | number
  name?: string | null
  tags?: { name: string }[] | null
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
