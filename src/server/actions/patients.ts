'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { patientSchema, type PatientInput } from '@/lib/validations'
import { createAuditLog } from '@/server/services/audit-service'

async function generateUniqueRecordNumber(): Promise<string> {
  let number: string
  let exists = true
  while (exists) {
    number = String(Math.floor(100000 + Math.random() * 900000))
    const existing = await prisma.patient.findUnique({
      where: { medicalRecordNumber: number },
    })
    exists = !!existing
  }
  return number!
}

export async function createPatient(input: PatientInput) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const validated = patientSchema.parse(input)
  const medicalRecordNumber = validated.medicalRecordNumber || await generateUniqueRecordNumber()

  const patient = await prisma.patient.create({
    data: {
      medicalRecordNumber,
      name: validated.name,
      dateOfBirth: validated.dateOfBirth,
      gender: validated.gender,
      suku: validated.suku,
      phone: validated.phone,
      address: validated.address,
      allergies: validated.allergies,
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
  date?: string  // format: 'YYYY-MM-DD'
}) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const { search, page = 1, limit = 10, date } = params ?? {}
  const skip = (page - 1) * limit

  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { medicalRecordNumber: { contains: search } },
        ],
      }
    : {}

  const dateFilter = date
    ? {
        createdAt: {
          gte: new Date(date + 'T00:00:00'),
          lt: new Date(date + 'T23:59:59'),
        },
      }
    : {}

  const where = {
    ...searchFilter,
    ...dateFilter,
  }

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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const patientsWithExamined = await Promise.all(
    patients.map(async (patient) => {
      const count = await prisma.medicalRecord.count({
        where: {
          patientId: patient.id,
          visitDate: { gte: today, lt: tomorrow },
        },
      })
      return { ...patient, examinedToday: count > 0 }
    })
  )

  return {
    data: patientsWithExamined,
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

export async function searchPatients(query: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' as const }
  }

  if (!query || query.length < 2) {
    return { data: [] }
  }

  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { medicalRecordNumber: { contains: query } },
        { phone: { contains: query } },
      ],
    },
    take: 10,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      medicalRecordNumber: true,
      name: true,
      dateOfBirth: true,
      gender: true,
      suku: true,
      phone: true,
      address: true,
      allergies: true,
    },
  })

  return { data: patients }
}
