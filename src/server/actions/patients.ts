'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { patientSchema, type PatientInput } from '@/lib/validations'
import { createAuditLog } from '@/server/services/audit-service'

export async function createPatient(input: PatientInput) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const validated = patientSchema.parse(input)

  const patient = await prisma.patient.create({
    data: {
      ...validated,
      createdById: session.user.id,
    },
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'CREATE',
    entity: 'Patient',
    entityId: patient.id,
    newValues: patient as unknown as Record<string, unknown>,
  })

  revalidatePath('/patients')
  return { data: patient }
}

export async function getPatients(params?: {
  search?: string
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const { search, page = 1, limit = 10 } = params ?? {}
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }
    : {}

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { medicalRecords: true, prescriptions: true } },
      },
    }),
    prisma.patient.count({ where }),
  ])

  return {
    data: patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getPatientById(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      medicalRecords: {
        orderBy: { visitDate: 'desc' },
        include: {
          doctor: { select: { id: true, name: true } },
          prescription: {
            include: {
              items: { include: { medicine: true } },
            },
          },
        },
      },
      prescriptions: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { medicine: true } },
          createdBy: { select: { id: true, name: true } },
          processedBy: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!patient) {
    return { error: 'Patient not found' }
  }

  return { data: patient }
}

export async function updatePatient(id: string, input: PatientInput) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can update patients' }
  }

  const oldPatient = await prisma.patient.findUnique({ where: { id } })
  if (!oldPatient) {
    return { error: 'Patient not found' }
  }

  const validated = patientSchema.parse(input)

  const patient = await prisma.patient.update({
    where: { id },
    data: validated,
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Patient',
    entityId: id,
    oldValues: oldPatient as unknown as Record<string, unknown>,
    newValues: patient as unknown as Record<string, unknown>,
  })

  revalidatePath('/patients')
  revalidatePath(`/patients/${id}`)
  return { data: patient }
}

export async function deletePatient(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can delete patients' }
  }

  const oldPatient = await prisma.patient.findUnique({ where: { id } })
  if (!oldPatient) {
    return { error: 'Patient not found' }
  }

  await prisma.patient.delete({ where: { id } })

  await createAuditLog({
    userId: session.user.id,
    action: 'DELETE',
    entity: 'Patient',
    entityId: id,
    oldValues: oldPatient as unknown as Record<string, unknown>,
  })

  revalidatePath('/patients')
  return { data: { success: true } }
}
