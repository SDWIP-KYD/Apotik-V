'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getAuditLogs(params?: {
  entity?: string
  userId?: string
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can view audit logs' }
  }

  const { entity, userId, page = 1, limit = 50 } = params ?? {}
  const skip = (page - 1) * limit

  const where = {
    ...(entity && { entity }),
    ...(userId && { userId }),
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getAuditLogById(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can view audit logs' }
  }

  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  if (!log) {
    return { error: 'Audit log not found' }
  }

  return { data: log }
}
