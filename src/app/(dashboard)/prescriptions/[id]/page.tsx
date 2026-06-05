import { getPrescriptionById } from '@/server/actions/prescriptions'
import { notFound } from 'next/navigation'
import { PrescriptionDetail } from '@/components/features/prescriptions/prescription-detail'

export default async function PrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const result = await getPrescriptionById(id)

  if (result.error || !result.data) {
    notFound()
  }

  return <PrescriptionDetail prescription={result.data as any} />
}
