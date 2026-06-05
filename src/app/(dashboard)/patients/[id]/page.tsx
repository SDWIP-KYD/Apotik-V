import { getPatientById } from '@/server/actions/patients'
import { getMedicines } from '@/server/actions/medicines'
import { notFound } from 'next/navigation'
import { PatientDetail } from '@/components/features/patients/patient-detail'

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [patientResult, medicinesResult] = await Promise.all([
    getPatientById(id),
    getMedicines({ limit: 100 }),
  ])

  if (patientResult.error || !patientResult.data) {
    notFound()
  }

  const medicines = (medicinesResult.data ?? []) as any[]

  return <PatientDetail patient={patientResult.data as any} medicines={medicines} />
}
