'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { medicineSchema, adjustStockSchema, type MedicineInput, type AdjustStockInput } from '@/lib/validations'
import { createAuditLog } from '@/server/services/audit-service'

export async function createMedicine(input: MedicineInput) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const validated = medicineSchema.parse(input)

  const medicine = await prisma.medicine.create({
    data: validated,
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'CREATE',
    entity: 'Medicine',
    entityId: medicine.id,
    newValues: medicine as unknown as Record<string, unknown>,
  })

  revalidatePath('/inventory')
  return { data: medicine }
}

export async function getMedicines(params?: {
  search?: string
  category?: string
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const { search, category, page = 1, limit = 20 } = params ?? {}
  const skip = (page - 1) * limit

  const where = {
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    ...(category && { category }),
  }

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.medicine.count({ where }),
  ])

  // Get unique categories for filter
  const categories = await prisma.medicine.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  })

  return {
    data: medicines,
    categories: categories.map((c) => c.category),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getMedicineById(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: {
      prescriptionItems: {
        include: {
          prescription: {
            select: { id: true, status: true, createdAt: true },
          },
        },
      },
    },
  })

  if (!medicine) {
    return { error: 'Medicine not found' }
  }

  return { data: medicine }
}

export async function updateMedicine(id: string, input: MedicineInput) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const oldMedicine = await prisma.medicine.findUnique({ where: { id } })
  if (!oldMedicine) {
    return { error: 'Medicine not found' }
  }

  const validated = medicineSchema.parse(input)

  const medicine = await prisma.medicine.update({
    where: { id },
    data: validated,
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Medicine',
    entityId: id,
    oldValues: oldMedicine as unknown as Record<string, unknown>,
    newValues: medicine as unknown as Record<string, unknown>,
  })

  revalidatePath('/inventory')
  return { data: medicine }
}

export async function deleteMedicine(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can delete medicines' }
  }

  const oldMedicine = await prisma.medicine.findUnique({ where: { id } })
  if (!oldMedicine) {
    return { error: 'Medicine not found' }
  }

  await prisma.medicine.delete({ where: { id } })

  await createAuditLog({
    userId: session.user.id,
    action: 'DELETE',
    entity: 'Medicine',
    entityId: id,
    oldValues: oldMedicine as unknown as Record<string, unknown>,
  })

  revalidatePath('/inventory')
  return { data: { success: true } }
}

export async function adjustStock(input: AdjustStockInput) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const validated = adjustStockSchema.parse(input)

  const medicine = await prisma.medicine.findUnique({
    where: { id: validated.medicineId },
  })

  if (!medicine) {
    return { error: 'Medicine not found' }
  }

  const newQty = medicine.stockQty + validated.quantity
  if (newQty < 0) {
    return { error: 'Stock cannot be negative' }
  }

  const updated = await prisma.medicine.update({
    where: { id: validated.medicineId },
    data: { stockQty: newQty },
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Medicine',
    entityId: validated.medicineId,
    oldValues: {
      stockQty: medicine.stockQty,
      reason: validated.reason,
    },
    newValues: {
      stockQty: newQty,
      reason: validated.reason,
    },
  })

  revalidatePath('/inventory')
  return { data: updated }
}

export async function getLowStockMedicines() {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const medicines = await prisma.medicine.findMany({
    where: {
      stockQty: { lte: prisma.medicine.fields.minThreshold },
    },
    orderBy: { stockQty: 'asc' },
  })

  return { data: medicines }
}

export async function getNearExpiryMedicines() {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const medicines = await prisma.medicine.findMany({
    where: {
      expiryDate: { lte: thirtyDaysFromNow },
    },
    orderBy: { expiryDate: 'asc' },
  })

  return { data: medicines }
}
