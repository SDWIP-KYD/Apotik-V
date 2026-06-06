import { getPrescriptions } from '@/server/actions/prescriptions'
import { PrescriptionList } from '@/components/features/prescriptions/prescription-list'

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; patientId?: string; page?: string }>
}) {
  const params = await searchParams
  const status = params.status || ''
  const patientId = params.patientId || ''
  const page = Number(params.page) || 1

  const result = await getPrescriptions({ status, patientId, page, limit: 20 })

  if (result.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Error loading prescriptions</p>
      </div>
    )
  }

  return (
    <PrescriptionList
      key={`${status}-${page}`}
      initialPrescriptions={result.data as any}
      pagination={result.pagination!}
      status={status}
    />
  )
}
