'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { prescriptionItemSchema, type PrescriptionItemInput } from '@/lib/validations'
import { createAuditLog } from '@/server/services/audit-service'

export async function getPrescriptions(params?: {
  status?: string
  patientId?: string
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const { status, patientId, page = 1, limit = 20 } = params ?? {}
  const skip = (page - 1) * limit

  const where = {
    ...(status && { status: status as any }),
    ...(patientId && { patientId }),
  }

  const [prescriptions, total] = await Promise.all([
    prisma.prescription.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        processedBy: { select: { id: true, name: true } },
        items: {
          include: {
            medicine: {
              select: { id: true, name: true, stockQty: true, unit: true },
            },
          },
        },
      },
    }),
    prisma.prescription.count({ where }),
  ])

  return {
    data: prescriptions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getPrescriptionById(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: {
      patient: true,
      record: true,
      createdBy: { select: { id: true, name: true } },
      processedBy: { select: { id: true, name: true } },
      items: {
        include: {
          medicine: true,
        },
      },
    },
  })

  if (!prescription) {
    return { error: 'Prescription not found' }
  }

  return { data: prescription }
}

export async function addPrescriptionItems(
  prescriptionId: string,
  items: PrescriptionItemInput[]
) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can add prescription items' }
  }

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
  })

  if (!prescription) {
    return { error: 'Prescription not found' }
  }

  if (prescription.status !== 'PENDING') {
    return { error: 'Can only add items to pending prescriptions' }
  }

  // Validate all items
  const validatedItems = items.map((item) => prescriptionItemSchema.parse(item))

  // Check stock for all items
  for (const item of validatedItems) {
    const medicine = await prisma.medicine.findUnique({
      where: { id: item.medicineId },
    })
    if (!medicine) {
      return { error: `Medicine not found: ${item.medicineId}` }
    }
    if (medicine.stockQty < item.quantity) {
      return {
        error: `Insufficient stock for ${medicine.name}. Available: ${medicine.stockQty}, Required: ${item.quantity}`,
      }
    }
  }

  // Add items
  await prisma.prescriptionItem.createMany({
    data: validatedItems.map((item) => ({
      ...item,
      prescriptionId,
    })),
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Prescription',
    entityId: prescriptionId,
    oldValues: { items: [] },
    newValues: { items: validatedItems },
  })

  revalidatePath('/prescriptions')
  revalidatePath(`/prescriptions/${prescriptionId}`)
  return { data: { success: true } }
}

export async function updatePrescriptionStatus(
  prescriptionId: string,
  status: 'PENDING' | 'PROCESSED' | 'COMPLETED' | 'CANCELLED'
) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: { items: true },
  })

  if (!prescription) {
    return { error: 'Prescription not found' }
  }

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    PENDING: ['PROCESSED', 'COMPLETED', 'CANCELLED'],
    PROCESSED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  }

  if (!validTransitions[prescription.status]?.includes(status)) {
    return { error: `Cannot transition from ${prescription.status} to ${status}` }
  }

  // Check permissions for cancel
  if (status === 'CANCELLED' && session.user.role !== 'DOCTOR') {
    return { error: 'Only doctors can cancel prescriptions' }
  }

  // If completing, deduct stock
  if (status === 'COMPLETED') {
    // Check stock for all items
    for (const item of prescription.items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      })
      if (!medicine || medicine.stockQty < item.quantity) {
        return {
          error: `Insufficient stock for ${medicine?.name ?? 'Unknown'}. Available: ${medicine?.stockQty ?? 0}, Required: ${item.quantity}`,
        }
      }
    }

    // Atomic transaction: deduct stock + update status
    await prisma.$transaction(async (tx) => {
      for (const item of prescription.items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stockQty: { decrement: item.quantity } },
        })
      }

      await tx.prescription.update({
        where: { id: prescriptionId },
        data: {
          status,
          processedById: session.user.id,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE',
          entity: 'Prescription',
          entityId: prescriptionId,
          oldValues: { status: prescription.status },
          newValues: { status },
        },
      })
    })
  } else {
    // Just update status
    await prisma.prescription.update({
      where: { id: prescriptionId },
      data: { status },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      entity: 'Prescription',
      entityId: prescriptionId,
      oldValues: { status: prescription.status },
      newValues: { status },
    })
  }

  revalidatePath('/prescriptions')
  revalidatePath(`/prescriptions/${prescriptionId}`)
  return { data: { success: true } }
}

export async function deletePrescriptionItem(itemId: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can delete prescription items' }
  }

  const item = await prisma.prescriptionItem.findUnique({
    where: { id: itemId },
    include: { prescription: true },
  })

  if (!item) {
    return { error: 'Item not found' }
  }

  if (item.prescription.status !== 'PENDING') {
    return { error: 'Can only delete items from pending prescriptions' }
  }

  await prisma.prescriptionItem.delete({ where: { id: itemId } })

  revalidatePath(`/prescriptions/${item.prescriptionId}`)
  return { data: { success: true } }
}
