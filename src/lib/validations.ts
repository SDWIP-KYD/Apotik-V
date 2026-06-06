import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const patientSchema = z.object({
  medicalRecordNumber: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.coerce.date({ message: 'Invalid date' }),
  gender: z.enum(['MALE', 'FEMALE']),
  suku: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
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

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const vitalSignsSchema = z.object({
  bloodPressureSystolic: z.coerce.number().int().min(60).max(300).optional().nullable(),
  bloodPressureDiastolic: z.coerce.number().int().min(30).max(200).optional().nullable(),
  temperature: z.coerce.number().min(30).max(45).optional().nullable(),
  respiratoryRate: z.coerce.number().int().min(5).max(60).optional().nullable(),
  heartRate: z.coerce.number().int().min(30).max(300).optional().nullable(),
  spo2: z.coerce.number().int().min(0).max(100).optional().nullable(),
  weight: z.coerce.number().min(0).max(500).optional().nullable(),
  height: z.coerce.number().min(0).max(300).optional().nullable(),
  diagnosisCode: z.string().max(20).optional().nullable(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type PatientInput = z.infer<typeof patientSchema>
export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>
export type MedicineInput = z.infer<typeof medicineSchema>
export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>
export type VitalSignsInput = z.infer<typeof vitalSignsSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
