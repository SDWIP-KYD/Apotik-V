import { getMedicineById } from '@/server/actions/medicines'
import { notFound } from 'next/navigation'
import { MedicineForm } from '@/components/forms/medicine-form'

export default async function MedicineDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { id } = await params
  const { edit } = await searchParams

  const result = await getMedicineById(id)

  if (result.error || !result.data) {
    notFound()
  }

  const medicine = result.data as any

  if (edit === 'true') {
    return (
      <div className="flex justify-center">
        <MedicineForm
          initialData={{
            id: medicine.id,
            name: medicine.name,
            category: medicine.category,
            unit: medicine.unit,
            stockQty: medicine.stockQty,
            minThreshold: medicine.minThreshold,
            expiryDate: medicine.expiryDate,
            batchNumber: medicine.batchNumber,
            price: medicine.price,
          }}
          mode="edit"
        />
      </div>
    )
  }

  // TODO: Create medicine detail view
  return (
    <div>
      <h1>Medicine Detail</h1>
      <p>{medicine.name}</p>
    </div>
  )
}
