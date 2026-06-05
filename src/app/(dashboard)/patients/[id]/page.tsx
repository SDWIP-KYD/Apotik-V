import { getPatientById } from '@/server/actions/patients'
import { notFound } from 'next/navigation'
import { PatientDetail } from '@/components/features/patients/patient-detail'

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { id } = await params
  const { edit } = await searchParams

  const result = await getPatientById(id)

  if (result.error || !result.data) {
    notFound()
  }

  return <PatientDetail patient={result.data as any} isEditing={edit === 'true'} />
}
