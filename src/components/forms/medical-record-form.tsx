'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { medicalRecordSchema, type MedicalRecordInput } from '@/lib/validations'
import { createMedicalRecord } from '@/server/actions/medical-records'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useState } from 'react'

interface MedicalRecordFormProps {
  patientId: string
  patientName: string
}

export function MedicalRecordForm({ patientId, patientName }: MedicalRecordFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MedicalRecordInput>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patientId,
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    },
  })

  async function onSubmit(data: MedicalRecordInput) {
    setIsLoading(true)

    try {
      const result = await createMedicalRecord(data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Medical record created. Prescription auto-generated.')
      reset()
      router.refresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Medical Record</CardTitle>
        <CardDescription>
          Create SOAP record for {patientName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('patientId')} />

          <div className="space-y-2">
            <Label htmlFor="subjective">Subjective (S) *</Label>
            <textarea
              id="subjective"
              {...register('subjective')}
              placeholder="Patient's symptoms, complaints, and history..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
            {errors.subjective && (
              <p className="text-sm text-red-500">{errors.subjective.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">Objective (O) *</Label>
            <textarea
              id="objective"
              {...register('objective')}
              placeholder="Vital signs, physical examination findings..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
            {errors.objective && (
              <p className="text-sm text-red-500">{errors.objective.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessment">Assessment (A) *</Label>
            <textarea
              id="assessment"
              {...register('assessment')}
              placeholder="Diagnosis, clinical impression..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
            {errors.assessment && (
              <p className="text-sm text-red-500">{errors.assessment.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan (P) *</Label>
            <textarea
              id="plan"
              {...register('plan')}
              placeholder="Treatment plan, medications, follow-up..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
            {errors.plan && (
              <p className="text-sm text-red-500">{errors.plan.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Create Record & Prescription'}
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
