'use server'

import { auth } from '@/lib/auth'
import icd10Data from '@/data/icd10.json'

interface IcdResult {
  code: string
  name: string
}

const icd10Codes: IcdResult[] = icd10Data as IcdResult[]

export async function searchIcd10(query: string): Promise<{ data?: IcdResult[]; error?: string }> {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (!query || query.length < 1) {
    return { data: [] }
  }

  const lowerQuery = query.toLowerCase()
  const results = icd10Codes
    .filter(c =>
      c.code.toLowerCase().includes(lowerQuery) ||
      c.name.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 15)

  return { data: results }
}
