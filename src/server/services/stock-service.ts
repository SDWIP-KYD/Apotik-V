import { prisma } from '@/lib/prisma'

export async function checkStockAvailability(
  items: Array<{ medicineId: string; quantity: number }>
) {
  const results = await Promise.all(
    items.map(async (item) => {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
        select: { id: true, name: true, stockQty: true, unit: true },
      })
      return {
        ...item,
        medicine,
        available: medicine ? medicine.stockQty >= item.quantity : false,
      }
    })
  )
  return results
}

export async function deductStock(
  items: Array<{ medicineId: string; quantity: number }>
) {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const medicine = await tx.medicine.findUnique({
        where: { id: item.medicineId },
      })
      if (!medicine || medicine.stockQty < item.quantity) {
        throw new Error(`Insufficient stock for ${medicine?.name ?? 'Unknown'}`)
      }
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stockQty: { decrement: item.quantity } },
      })
    }
  })
}
