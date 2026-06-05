'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema, type PatientInput } from '@/lib/validations'
import { createPatient, updatePatient } from '@/server/actions/patients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { useState } from 'react'

interface PatientFormProps {
  initialData?: {
    id: string
    medicalRecordNumber?: string
    name: string
    dateOfBirth: string
    gender: string
    suku?: string | null
    phone?: string | null
    address?: string | null
    allergies?: string | null
  }
  mode?: 'create' | 'edit'
}

export function PatientForm({ initialData, mode = 'create' }: PatientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData
      ? {
          medicalRecordNumber: initialData.medicalRecordNumber ?? '',
          name: initialData.name,
          dateOfBirth: new Date(initialData.dateOfBirth),
          gender: initialData.gender as 'MALE' | 'FEMALE',
          suku: initialData.suku ?? '',
          phone: initialData.phone ?? '',
          address: initialData.address ?? '',
          allergies: initialData.allergies ?? '',
        }
      : {
          medicalRecordNumber: '',
          name: '',
          dateOfBirth: new Date(),
          gender: 'MALE' as const,
          suku: '',
          phone: '',
          address: '',
          allergies: '',
        },
  })

  const { register, handleSubmit, formState: { errors } } = form

  async function onSubmit(data: any) {
    setIsLoading(true)

    try {
      const result = initialData
        ? await updatePatient(initialData.id, data as PatientInput)
        : await createPatient(data as PatientInput)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(initialData ? 'Patient updated' : 'Patient created')
      router.push('/patients')
      router.refresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Add New Patient' : 'Edit Patient'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Medical record number will be generated automatically'
            : `No. RM: ${initialData?.medicalRecordNumber || '-'}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register('name')} disabled={isLoading} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                disabled={isLoading}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                {...register('gender')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="suku">Suku / Ethnicity</Label>
              <Input id="suku" {...register('suku')} placeholder="e.g. Jawa, Sunda, Bugis" disabled={isLoading} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input id="allergies" {...register('allergies')} placeholder="List any known allergies..." disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              {...register('address')}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Patient' : 'Update Patient'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
