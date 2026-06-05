'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { medicalRecordSchema, type MedicalRecordInput } from '@/lib/validations'
import { createAuditLog } from '@/server/services/audit-service'

export async function createMedicalRecord(input: MedicalRecordInput) {
  const session = await auth()
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  if (session.user.role !== 'DOCTOR') {
    return { error: 'Forbidden: Only doctors can create medical records' }
  }

  const validated = medicalRecordSchema.parse(input)

  // Create medical record and prescription in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.medicalRecord.create({
      data: {
        patientId: validated.patientId,
        doctorId: session.user.id,
        subjective: validated.subjective,
        objective: validated.objective,
        assessment: validated.assessment,
        plan: validated.plan,
      },
    })

    // Auto-create prescription
    const prescription = await tx.prescription.create({
      data: {
        recordId: record.id,
        patientId: validated.patientId,
        createdById: session.user.id,
      },
    })

    return { record, prescription }
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'CREATE',
    entity: 'MedicalRecord',
    entityId: result.record.id,
    newValues: {
      ...result.record,
      prescription: result.prescription,
    } as unknown as Record<string, unknown>,
  })

  revalidatePath(`/medical-records/${validated.patientId}`)
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
  input: Omit<MedicalRecordInput, 'patientId'>
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

  const record = await prisma.medicalRecord.update({
    where: { id },
    data: validated,
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'MedicalRecord',
    entityId: id,
    oldValues: oldRecord as unknown as Record<string, unknown>,
    newValues: record as unknown as Record<string, unknown>,
  })

  revalidatePath(`/medical-records/${oldRecord.patientId}`)
  return { data: record }
}
