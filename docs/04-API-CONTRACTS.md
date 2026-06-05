# Apotik-V - API Contracts

**Version:** 1.0  
**Last Updated:** 2026-02-07  
**Status:** MVP

---

## 1. API Architecture

Apotik-V uses **Server Actions** as the primary API mechanism, with **API Routes** for auth endpoints.

### 1.1 Server Actions (Primary)

- Type-safe (TypeScript)
- Direct function calls from Client Components
- Automatic form data parsing
- Progressive enhancement support

### 1.2 API Routes (Auth Only)

- `/api/auth/[...nextauth]` - NextAuth.js handler

---

## 2. Server Actions

### 2.1 Patient Actions (`src/server/actions/patients.ts`)

#### createPatient
```typescript
'use server'
// File: src/server/actions/patients.ts

import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const createPatientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE']),
  phone: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
})

export async function createPatient(input: z.infer<typeof createPatientSchema>) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const validated = createPatientSchema.parse(input)

  const patient = await prisma.patient.create({
    data: {
      ...validated,
      createdById: session.user.id,
    },
  })

  revalidatePath('/patients')
  return { data: patient }
}
```

**Input:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | min 1 char |
| dateOfBirth | date | Yes | valid date |
| gender | enum | Yes | MALE / FEMALE |
| phone | string | No | - |
| address | string | No | - |
| allergies | string | No | - |

**Response:**
```typescript
{ data: Patient } | { error: string }
```

**Access:** DOCTOR, STAFF

---

#### getPatients
```typescript
export async function getPatients(params?: {
  search?: string
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const { search, page = 1, limit = 10 } = params ?? {}
  const skip = (page - 1) * limit

  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ],
  } : {}

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true } } },
    }),
    prisma.patient.count({ where }),
  ])

  return {
    data: patients,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}
```

**Input:**
| Field | Type | Required | Default |
|-------|------|----------|---------|
| search | string | No | - |
| page | number | No | 1 |
| limit | number | No | 10 |

**Response:**
```typescript
{
  data: Patient[]
  pagination: { page, limit, total, totalPages }
}
```

**Access:** DOCTOR, STAFF

---

#### getPatientById
```typescript
export async function getPatientById(id: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      medicalRecords: {
        orderBy: { visitDate: 'desc' },
        include: { doctor: { select: { id: true, name: true } } },
      },
      prescriptions: {
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { medicine: true } } },
      },
    },
  })

  if (!patient) return { error: 'Patient not found' }
  return { data: patient }
}
```

**Access:** DOCTOR, STAFF

---

#### updatePatient
```typescript
export async function updatePatient(id: string, input: z.infer<typeof createPatientSchema>) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }
  if (session.user.role !== 'DOCTOR') return { error: 'Forbidden' }

  const oldPatient = await prisma.patient.findUnique({ where: { id } })
  const validated = createPatientSchema.parse(input)

  const patient = await prisma.patient.update({
    where: { id },
    data: validated,
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Patient',
    entityId: id,
    oldValues: oldPatient,
    newValues: patient,
  })

  revalidatePath('/patients')
  return { data: patient }
}
```

**Access:** DOCTOR ONLY

---

#### deletePatient
```typescript
export async function deletePatient(id: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }
  if (session.user.role !== 'DOCTOR') return { error: 'Forbidden' }

  const oldPatient = await prisma.patient.findUnique({ where: { id } })

  await prisma.patient.delete({ where: { id } })

  await createAuditLog({
    userId: session.user.id,
    action: 'DELETE',
    entity: 'Patient',
    entityId: id,
    oldValues: oldPatient,
  })

  revalidatePath('/patients')
  return { data: { success: true } }
}
```

**Access:** DOCTOR ONLY

---

### 2.2 Medical Record Actions (`src/server/actions/medical-records.ts`)

#### createMedicalRecord
```typescript
const createMedicalRecordSchema = z.object({
  patientId: z.string().min(1),
  subjective: z.string().min(1),
  objective: z.string().min(1),
  assessment: z.string().min(1),
  plan: z.string().min(1),
})

export async function createMedicalRecord(input: z.infer<typeof createMedicalRecordSchema>) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }
  if (session.user.role !== 'DOCTOR') return { error: 'Forbidden' }

  const validated = createMedicalRecordSchema.parse(input)

  const record = await prisma.medicalRecord.create({
    data: {
      ...validated,
      doctorId: session.user.id,
    },
  })

  // Auto-create prescription
  const prescription = await prisma.prescription.create({
    data: {
      recordId: record.id,
      patientId: validated.patientId,
      createdById: session.user.id,
    },
  })

  revalidatePath(`/medical-records/${validated.patientId}`)
  return { data: { record, prescription } }
}
```

**Input:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| patientId | string | Yes | Valid CUID |
| subjective | string | Yes | SOAP-S |
| objective | string | Yes | SOAP-O |
| assessment | string | Yes | SOAP-A |
| plan | string | Yes | SOAP-P |

**Response:**
```typescript
{ data: { record: MedicalRecord, prescription: Prescription } } | { error: string }
```

**Access:** DOCTOR ONLY

---

#### getMedicalRecordsByPatient
```typescript
export async function getMedicalRecordsByPatient(patientId: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const records = await prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { visitDate: 'desc' },
    include: {
      doctor: { select: { id: true, name: true } },
      prescription: {
        include: { items: { include: { medicine: true } } },
      },
    },
  })

  return { data: records }
}
```

**Access:** DOCTOR, STAFF (Read Only)

---

### 2.3 Medicine Actions (`src/server/actions/medicines.ts`)

#### createMedicine
```typescript
const createMedicineSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  stockQty: z.coerce.number().int().min(0),
  minThreshold: z.coerce.number().int().min(0).default(10),
  expiryDate: z.coerce.date(),
  batchNumber: z.string().min(1),
  price: z.coerce.number().min(0),
})

export async function createMedicine(input: z.infer<typeof createMedicineSchema>) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const validated = createMedicineSchema.parse(input)

  const medicine = await prisma.medicine.create({ data: validated })
  revalidatePath('/inventory')
  return { data: medicine }
}
```

**Access:** DOCTOR, STAFF

---

#### getMedicines
```typescript
export async function getMedicines(params?: {
  search?: string
  category?: string
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const { search, category, page = 1, limit = 20 } = params ?? {}
  const skip = (page - 1) * limit

  const where = {
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
    ...(category && { category }),
  }

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.medicine.count({ where }),
  ])

  return {
    data: medicines,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}
```

**Access:** DOCTOR, STAFF

---

#### updateMedicine
```typescript
export async function updateMedicine(id: string, input: z.infer<typeof createMedicineSchema>) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const oldMedicine = await prisma.medicine.findUnique({ where: { id } })
  const validated = createMedicineSchema.parse(input)

  const medicine = await prisma.medicine.update({ where: { id }, data: validated })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Medicine',
    entityId: id,
    oldValues: oldMedicine,
    newValues: medicine,
  })

  revalidatePath('/inventory')
  return { data: medicine }
}
```

**Access:** DOCTOR, STAFF

---

#### deleteMedicine
```typescript
export async function deleteMedicine(id: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }
  if (session.user.role !== 'DOCTOR') return { error: 'Forbidden' }

  const oldMedicine = await prisma.medicine.findUnique({ where: { id } })
  await prisma.medicine.delete({ where: { id } })

  await createAuditLog({
    userId: session.user.id,
    action: 'DELETE',
    entity: 'Medicine',
    entityId: id,
    oldValues: oldMedicine,
  })

  revalidatePath('/inventory')
  return { data: { success: true } }
}
```

**Access:** DOCTOR ONLY

---

#### adjustStock
```typescript
const adjustStockSchema = z.object({
  medicineId: z.string().min(1),
  quantity: z.coerce.number().int(),
  reason: z.string().min(1),
})

export async function adjustStock(input: z.infer<typeof adjustStockSchema>) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const { medicineId, quantity, reason } = adjustStockSchema.parse(input)

  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } })
  if (!medicine) return { error: 'Medicine not found' }

  const newQty = medicine.stockQty + quantity
  if (newQty < 0) return { error: 'Stock cannot be negative' }

  const updated = await prisma.medicine.update({
    where: { id: medicineId },
    data: { stockQty: newQty },
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Medicine',
    entityId: medicineId,
    oldValues: { stockQty: medicine.stockQty, reason },
    newValues: { stockQty: newQty, reason },
  })

  revalidatePath('/inventory')
  return { data: updated }
}
```

**Input:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| medicineId | string | Yes | Valid CUID |
| quantity | int | Yes | Positive = add, Negative = reduce |
| reason | string | Yes | Reason for adjustment |

**Access:** DOCTOR, STAFF

---

### 2.4 Prescription Actions (`src/server/actions/prescriptions.ts`)

#### getPrescriptions
```typescript
export async function getPrescriptions(params?: {
  status?: PrescriptionStatus
  patientId?: string
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const { status, patientId, page = 1, limit = 20 } = params ?? {}
  const skip = (page - 1) * limit

  const where = {
    ...(status && { status }),
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
        items: { include: { medicine: { select: { id: true, name: true, stockQty: true, unit: true } } } },
      },
    }),
    prisma.prescription.count({ where }),
  ])

  return {
    data: prescriptions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}
```

**Access:** DOCTOR, STAFF

---

#### getPrescriptionById
```typescript
export async function getPrescriptionById(id: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: {
      patient: true,
      record: true,
      createdBy: { select: { id: true, name: true } },
      processedBy: { select: { id: true, name: true } },
      items: { include: { medicine: true } },
    },
  })

  if (!prescription) return { error: 'Prescription not found' }
  return { data: prescription }
}
```

**Access:** DOCTOR, STAFF

---

#### updatePrescriptionStatus
```typescript
const updateStatusSchema = z.object({
  prescriptionId: z.string().min(1),
  status: z.enum(['PENDING', 'PROCESSED', 'COMPLETED', 'CANCELLED']),
})

export async function updatePrescriptionStatus(input: z.infer<typeof updateStatusSchema>) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const { prescriptionId, status } = updateStatusSchema.parse(input)

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: { items: true },
  })

  if (!prescription) return { error: 'Prescription not found' }

  // Validation rules
  if (status === 'CANCELLED' && session.user.role !== 'DOCTOR') {
    return { error: 'Only doctors can cancel prescriptions' }
  }

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
    await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status,
        ...(status === 'COMPLETED' && { processedById: session.user.id }),
      },
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
  return { data: { success: true } }
}
```

**Status Transitions:**
| Current | Allowed Next | Who |
|---------|-------------|-----|
| PENDING | PROCESSED, CANCELLED | Staff, Doctor |
| PROCESSED | COMPLETED, CANCELLED | Staff, Doctor |
| COMPLETED | (none) | (none) |
| CANCELLED | (none) | (none) |

**Stock Deduction:** Happens ONLY when status changes to COMPLETED.

**Access:** Staff (status update), Doctor (cancel + all)

---

#### addPrescriptionItems
```typescript
const addItemsSchema = z.object({
  prescriptionId: z.string().min(1),
  items: z.array(z.object({
    medicineId: z.string().min(1),
    dosage: z.string().min(1),
    quantity: z.coerce.number().int().positive(),
    notes: z.string().optional(),
  })),
})

export async function addPrescriptionItems(input: z.infer<typeof addItemsSchema>) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }
  if (session.user.role !== 'DOCTOR') return { error: 'Forbidden' }

  const { prescriptionId, items } = addItemsSchema.parse(input)

  // Validate stock for each item
  for (const item of items) {
    const medicine = await prisma.medicine.findUnique({
      where: { id: item.medicineId },
    })
    if (!medicine) return { error: `Medicine not found: ${item.medicineId}` }
    if (medicine.stockQty < item.quantity) {
      return { error: `Insufficient stock for ${medicine.name}` }
    }
  }

  const prescriptionItems = await prisma.prescriptionItem.createMany({
    data: items.map((item) => ({
      ...item,
      prescriptionId,
    })),
  })

  revalidatePath('/prescriptions')
  return { data: prescriptionItems }
}
```

**Access:** DOCTOR ONLY

---

### 2.5 Audit Log Actions (`src/server/actions/audit-logs.ts`)

#### getAuditLogs
```typescript
export async function getAuditLogs(params?: {
  entity?: string
  userId?: string
  action?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }
  if (session.user.role !== 'DOCTOR') return { error: 'Forbidden' }

  const { entity, userId, action, startDate, endDate, page = 1, limit = 50 } = params ?? {}
  const skip = (page - 1) * limit

  const where = {
    ...(entity && { entity }),
    ...(userId && { userId }),
    ...(action && { action }),
    ...(startDate && endDate && {
      timestamp: { gte: startDate, lte: endDate },
    }),
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    data: logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}
```

**Access:** DOCTOR ONLY

---

## 3. Audit Service (`src/server/services/audit-service.ts`)

```typescript
import { prisma } from '@/lib/prisma'

interface AuditLogInput {
  userId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string
  entityId: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
}

export async function createAuditLog(input: AuditLogInput) {
  return prisma.auditLog.create({ data: input })
}
```

---

## 4. Stock Service (`src/server/services/stock-service.ts`)

```typescript
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
```

---

## 5. Error Response Format

All Server Actions return either `{ data: T }` or `{ error: string }`.

```typescript
// Success
{ data: { id: "...", name: "..." } }

// Error
{ error: "Unauthorized" }
{ error: "Insufficient stock for Paracetamol 500mg" }
{ error: "Patient not found" }
```

---

## 6. Validation Schemas (`src/lib/validations.ts`)

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const patientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE']),
  phone: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
})

export const medicalRecordSchema = z.object({
  patientId: z.string().min(1),
  subjective: z.string().min(1, 'Subjective is required'),
  objective: z.string().min(1, 'Objective is required'),
  assessment: z.string().min(1, 'Assessment is required'),
  plan: z.string().min(1, 'Plan is required'),
})

export const medicineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  stockQty: z.coerce.number().int().min(0),
  minThreshold: z.coerce.number().int().min(0).default(10),
  expiryDate: z.coerce.date(),
  batchNumber: z.string().min(1, 'Batch number is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
})

export const prescriptionItemSchema = z.object({
  medicineId: z.string().min(1),
  dosage: z.string().min(1, 'Dosage is required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  notes: z.string().optional(),
})
```

---

**End of Document**
