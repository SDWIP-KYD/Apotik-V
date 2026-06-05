'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PatientForm } from '@/components/forms/patient-form'
import { ArrowLeft, Edit, FileText, Pill } from 'lucide-react'
import { format } from 'date-fns'

interface MedicalRecord {
  id: string
  visitDate: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  doctor: { id: string; name: string }
  prescription?: {
    id: string
    status: string
    items: Array<{
      medicine: { name: string; unit: string }
      dosage: string
      quantity: number
    }>
  }
}

interface Prescription {
  id: string
  status: string
  createdAt: string
  createdBy: { id: string; name: string }
  processedBy?: { id: string; name: string } | null
  items: Array<{
    medicine: { name: string; unit: string; stockQty: number }
    dosage: string
    quantity: number
  }>
}

interface Patient {
  id: string
  name: string
  dateOfBirth: string
  gender: string
  phone?: string | null
  address?: string | null
  allergies?: string | null
  createdAt: string
  createdBy: { id: string; name: string }
  medicalRecords: MedicalRecord[]
  prescriptions: Prescription[]
}

interface PatientDetailProps {
  patient: Patient
  isEditing?: boolean
}

export function PatientDetail({ patient, isEditing = false }: PatientDetailProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [editing, setEditing] = useState(isEditing)

  const isDoctor = session?.user?.role === 'DOCTOR'

  function calculateAge(dateOfBirth: string) {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (editing) {
    return (
      <div className="flex justify-center">
        <PatientForm
          initialData={{
            id: patient.id,
            name: patient.name,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            phone: patient.phone,
            address: patient.address,
            allergies: patient.allergies,
          }}
          mode="edit"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <p className="text-muted-foreground">
              Patient ID: {patient.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        {isDoctor && (
          <Button onClick={() => setEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{calculateAge(patient.dateOfBirth)} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <Badge variant={patient.gender === 'MALE' ? 'default' : 'secondary'}>
                  {patient.gender}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{patient.phone || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{patient.address || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Allergies</p>
              {patient.allergies ? (
                <Badge variant="destructive">{patient.allergies}</Badge>
              ) : (
                <p className="font-medium">None known</p>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Registered by</p>
              <p className="font-medium">{patient.createdBy.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visit History</CardTitle>
            <CardDescription>
              {patient.medicalRecords.length} visit{patient.medicalRecords.length !== 1 ? 's' : ''} recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patient.medicalRecords.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No visits recorded yet
              </p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {patient.medicalRecords.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {format(new Date(record.visitDate), 'PPP')}
                      </p>
                      <Badge variant="outline">{record.doctor.name}</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Assessment:</span>{' '}
                        {record.assessment}
                      </p>
                      {record.prescription && (
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4" />
                          <Badge className={getStatusColor(record.prescription.status)}>
                            {record.prescription.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
          <CardDescription>
            {patient.prescriptions.length} prescription{patient.prescriptions.length !== 1 ? 's' : ''} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patient.prescriptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No prescriptions yet
            </p>
          ) : (
            <div className="space-y-4">
              {patient.prescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(prescription.createdAt), 'PPP')}
                    </p>
                    <Badge className={getStatusColor(prescription.status)}>
                      {prescription.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {prescription.items.map((item, idx) => (
                      <p key={idx} className="text-sm">
                        {item.medicine.name} - {item.dosage} x {item.quantity} {item.medicine.unit}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created by: {prescription.createdBy.name}
                    {prescription.processedBy && ` | Processed by: ${prescription.processedBy.name}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
