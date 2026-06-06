import { getPatientsWithRecords } from '@/server/actions/medical-records'
import { MedicalRecordsList } from '@/components/features/medical-records/medical-records-list'

export default async function MedicalRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''
  const page = Number(params.page) || 1

  const result = await getPatientsWithRecords({ search, page, limit: 20 })

  if (result.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Error loading records</p>
      </div>
    )
  }

  return (
    <MedicalRecordsList
      key={`${search}-${page}`}
      initialPatients={result.data as any}
      pagination={result.pagination!}
      search={search}
    />
  )
}
