import { getPatients } from '@/server/actions/patients'
import { PatientList } from '@/components/features/patients/patient-list'

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''
  const page = Number(params.page) || 1

  const result = await getPatients({ search, page, limit: 10 })

  if (result.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Error loading patients</p>
      </div>
    )
  }

  return (
    <PatientList
      initialPatients={result.data as any}
      pagination={result.pagination!}
      search={search}
    />
  )
}
