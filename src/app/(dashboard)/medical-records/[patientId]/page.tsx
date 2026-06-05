import { getPatientById } from '@/server/actions/patients'
import { notFound } from 'next/navigation'
import { MedicalRecordPageContent } from '@/components/features/medical-records/medical-record-page'

export default async function MedicalRecordPage({
  params,
}: {
  params: Promise<{ patientId: string }>
}) {
  const { patientId } = await params

  const result = await getPatientById(patientId)

  if (result.error || !result.data) {
    notFound()
  }

  return <MedicalRecordPageContent patient={result.data as any} />
}
