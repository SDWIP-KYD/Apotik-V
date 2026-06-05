import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const patientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.coerce.date({ message: 'Invalid date' }),
  gender: z.enum(['MALE', 'FEMALE']),
  phone: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
})

export const medicalRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  subjective: z.string().min(1, 'Subjective is required'),
  objective: z.string().min(1, 'Objective is required'),
  assessment: z.string().min(1, 'Assessment is required'),
  plan: z.string().min(1, 'Plan is required'),
})

export const medicineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  stockQty: z.coerce.number().int().min(0, 'Stock must be positive'),
  minThreshold: z.coerce.number().int().min(0).default(10),
  expiryDate: z.coerce.date({ message: 'Invalid date' }),
  batchNumber: z.string().min(1, 'Batch number is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
})

export const prescriptionItemSchema = z.object({
  medicineId: z.string().min(1),
  dosage: z.string().min(1, 'Dosage is required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  notes: z.string().optional(),
})

export const adjustStockSchema = z.object({
  medicineId: z.string().min(1),
  quantity: z.coerce.number().int(),
  reason: z.string().min(1, 'Reason is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type PatientInput = z.infer<typeof patientSchema>
export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>
export type MedicineInput = z.infer<typeof medicineSchema>
export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>
