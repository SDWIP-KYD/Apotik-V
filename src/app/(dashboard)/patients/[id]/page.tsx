import { getPatientById } from '@/server/actions/patients'
import { notFound } from 'next/navigation'
import { PatientDetail } from '@/components/features/patients/patient-detail'

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const patientResult = await getPatientById(id)

  if (patientResult.error || !patientResult.data) {
    notFound()
  }

  const patient = JSON.parse(JSON.stringify(patientResult.data))
  return <PatientDetail patient={patient} />
}
