import { getMedicines } from '@/server/actions/medicines'
import { InventoryTable } from '@/components/features/inventory/inventory-table'

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const search = params.search || ''
  const category = params.category || ''
  const page = Number(params.page) || 1

  const result = await getMedicines({ search, category, page, limit: 20 })

  if (result.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Error loading inventory</p>
      </div>
    )
  }

  return (
    <InventoryTable
      key={`${search}-${category}-${page}`}
      initialMedicines={result.data as any}
      categories={result.categories || []}
      pagination={result.pagination!}
      search={search}
      category={category}
    />
  )
}
