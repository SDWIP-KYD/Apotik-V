'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, endOfDay, isAfter } from 'date-fns'

export async function getDashboardStats() {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const nextWeek = subDays(now, -7)

  const [
    totalPatients,
    patientsToday,
    lowStockMedicines,
    nearExpiryMedicines,
    pendingPrescriptions,
    recentPrescriptions,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
    prisma.medicine.findMany({
      where: {
        stockQty: { lte: 5 },
      },
      orderBy: { stockQty: 'asc' },
      take: 5,
    }),
    prisma.medicine.findMany({
      where: {
        expiryDate: {
          gte: now,
          lte: nextWeek,
        },
      },
      orderBy: { expiryDate: 'asc' },
      take: 5,
    }),
    prisma.prescription.count({
      where: { status: 'PENDING' },
    }),
    prisma.prescription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        patient: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    }),
  ])

  return {
    data: {
      totalPatients,
      patientsToday,
      criticalStockCount: lowStockMedicines.length,
      nearExpiryCount: nearExpiryMedicines.length,
      pendingPrescriptions,
      lowStockMedicines,
      nearExpiryMedicines,
      recentPrescriptions,
    },
  }
}
