import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'

interface AuditLogInput {
  userId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string
  entityId: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
}

export async function createAuditLog(input: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      oldValues: input.oldValues ? (input.oldValues as Prisma.InputJsonValue) : undefined,
      newValues: input.newValues ? (input.newValues as Prisma.InputJsonValue) : undefined,
    },
  })
}
