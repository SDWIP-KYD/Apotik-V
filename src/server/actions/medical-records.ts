'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { medicalRecordSchema, type MedicalRecordInput, prescriptionItemSchema, type PrescriptionItemInput } from '@/lib/validations'
import { createAuditLog } from '@/server/services/audit-service'

interface CreateRecordInput extends MedicalRecordInput {
  prescriptionItems?: PrescriptionItemInput[]
  bloodPressureSystolic?: number | null
  bloodPressureDiastolic?: number | null
  temperature?: number | null
  respiratoryRate?: number | null
  heartRate?: number | null
  spo2?: number | null
  weight?: number | null
  height?: number | null
  diagnosisCode?: string | null
}

export async function createMedicalRecord(input: CreateRecordInput) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can create medical records' }
  }

  const validated = medicalRecordSchema.parse(input)

  // Validate prescription items if provided
  const items = input.prescriptionItems?.map((item) => prescriptionItemSchema.parse(item)) ?? []

  // Create medical record + prescription + items in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.medicalRecord.create({
      data: {
        patientId: validated.patientId,
        doctorId: session.user.id,
        subjective: validated.subjective,
        objective: validated.objective,
        assessment: validated.assessment,
        plan: validated.plan,
        bloodPressureSystolic: input.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: input.bloodPressureDiastolic ?? null,
        temperature: input.temperature ?? null,
        respiratoryRate: input.respiratoryRate ?? null,
        heartRate: input.heartRate ?? null,
        spo2: input.spo2 ?? null,
        weight: input.weight ?? null,
        height: input.height ?? null,
        diagnosisCode: input.diagnosisCode ?? null,
      },
    })

    let prescription = null
    if (items.length > 0) {
      prescription = await tx.prescription.create({
        data: {
          recordId: record.id,
          patientId: validated.patientId,
          status: 'PENDING',
          createdById: session.user.id,
        },
      })

      await tx.prescriptionItem.createMany({
        data: items.map((item) => ({
          prescriptionId: prescription!.id,
          medicineId: item.medicineId,
          dosage: item.dosage,
          quantity: item.quantity,
          notes: item.notes,
        })),
      })
    }

    return { record, prescription }
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'CREATE',
    entity: 'MedicalRecord',
    entityId: result.record.id,
    newValues: {
      ...result.record,
      ...(result.prescription ? { prescription: result.prescription } : {}),
    } as unknown as Record<string, unknown>,
  })

  revalidatePath('/patients')
  revalidatePath(`/patients/${validated.patientId}`)
  return { data: result }
}

export async function getMedicalRecordsByPatient(patientId: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const records = await prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { visitDate: 'desc' },
    include: {
      doctor: { select: { id: true, name: true } },
      prescription: {
        include: {
          items: { include: { medicine: true } },
        },
      },
    },
  })

  return { data: records }
}

export async function getMedicalRecordById(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const record = await prisma.medicalRecord.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: { select: { id: true, name: true } },
      prescription: {
        include: {
          items: { include: { medicine: true } },
        },
      },
    },
  })

  if (!record) {
    return { error: 'Medical record not found' }
  }

  return { data: record }
}

export async function updateMedicalRecord(
  id: string,
  input: Omit<MedicalRecordInput, 'patientId'> & {
    patientId: string
    bloodPressureSystolic?: number | null
    bloodPressureDiastolic?: number | null
    temperature?: number | null
    respiratoryRate?: number | null
    heartRate?: number | null
    spo2?: number | null
    weight?: number | null
    height?: number | null
    diagnosisCode?: string | null
    prescriptionItems?: PrescriptionItemInput[]
  }
) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can update medical records' }
  }

  const oldRecord = await prisma.medicalRecord.findUnique({ where: { id } })
  if (!oldRecord) {
    return { error: 'Medical record not found' }
  }

  const validated = medicalRecordSchema.omit({ patientId: true }).parse(input)

  // Validate prescription items if provided
  const items = input.prescriptionItems?.map((item) => prescriptionItemSchema.parse(item)) ?? []

  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.medicalRecord.update({
      where: { id },
      data: {
        ...validated,
        bloodPressureSystolic: input.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: input.bloodPressureDiastolic ?? null,
        temperature: input.temperature ?? null,
        respiratoryRate: input.respiratoryRate ?? null,
        heartRate: input.heartRate ?? null,
        spo2: input.spo2 ?? null,
        weight: input.weight ?? null,
        height: input.height ?? null,
        diagnosisCode: input.diagnosisCode ?? null,
      },
    })

    // Handle prescription items
    const existingPrescription = await tx.prescription.findUnique({
      where: { recordId: id },
      include: { items: true },
    })

    if (items.length > 0) {
      if (existingPrescription) {
        // Delete existing items and recreate
        await tx.prescriptionItem.deleteMany({
          where: { prescriptionId: existingPrescription.id },
        })
        await tx.prescriptionItem.createMany({
          data: items.map((item) => ({
            prescriptionId: existingPrescription.id,
            medicineId: item.medicineId,
            dosage: item.dosage,
            quantity: item.quantity,
            notes: item.notes,
          })),
        })
      } else {
        // Create new prescription + items
        const prescription = await tx.prescription.create({
          data: {
            recordId: id,
            patientId: input.patientId,
            status: 'PENDING',
            createdById: session.user.id,
          },
        })
        await tx.prescriptionItem.createMany({
          data: items.map((item) => ({
            prescriptionId: prescription.id,
            medicineId: item.medicineId,
            dosage: item.dosage,
            quantity: item.quantity,
            notes: item.notes,
          })),
        })
      }
    } else if (existingPrescription) {
      // No items provided but prescription exists: delete it
      await tx.prescriptionItem.deleteMany({
        where: { prescriptionId: existingPrescription.id },
      })
      await tx.prescription.delete({
        where: { id: existingPrescription.id },
      })
    }

    return record
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'MedicalRecord',
    entityId: id,
    oldValues: oldRecord as unknown as Record<string, unknown>,
    newValues: result as unknown as Record<string, unknown>,
  })

  revalidatePath('/patients')
  revalidatePath(`/patients/${oldRecord.patientId}`)
  return { data: result }
}

export async function deleteMedicalRecord(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can delete medical records' }
  }

  const record = await prisma.medicalRecord.findUnique({
    where: { id },
    include: { prescription: { include: { items: true } } },
  })

  if (!record) {
    return { error: 'Medical record not found' }
  }

  await prisma.$transaction(async (tx) => {
    // Delete prescription items first
    if (record.prescription) {
      await tx.prescriptionItem.deleteMany({
        where: { prescriptionId: record.prescription.id },
      })
      await tx.prescription.delete({
        where: { id: record.prescription.id },
      })
    }
    await tx.medicalRecord.delete({ where: { id } })
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'DELETE',
    entity: 'MedicalRecord',
    entityId: id,
    oldValues: record as unknown as Record<string, unknown>,
  })

  revalidatePath('/patients')
  revalidatePath('/medical-records')
  revalidatePath(`/patients/${record.patientId}`)
  return { data: { success: true } }
}

export async function getPatientsWithRecords(params?: {
  search?: string
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const { search, page = 1, limit = 20 } = params ?? {}
  const skip = (page - 1) * limit

  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { medicalRecordNumber: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    : {}

  const where = {
    ...searchFilter,
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        medicalRecordNumber: true,
        isActive: true,
        _count: { select: { medicalRecords: true } },
        medicalRecords: {
          orderBy: { visitDate: 'desc' },
          take: 1,
          select: { visitDate: true, assessment: true },
        },
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
      return {
        ...patient,
        examinedToday: count > 0,
        lastVisit: patient.medicalRecords[0] || null,
      }
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

