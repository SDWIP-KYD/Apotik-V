'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MedicalRecordForm } from '@/components/forms/medical-record-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Pill } from 'lucide-react'
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
      medicine: { name: string; unit: string; stockQty: number }
      dosage: string
      quantity: number
    }>
  }
}

interface Patient {
  id: string
  name: string
  dateOfBirth: string
  gender: string
  medicalRecords: MedicalRecord[]
}

interface MedicalRecordPageContentProps {
  patient: Patient
}

export function MedicalRecordPageContent({ patient }: MedicalRecordPageContentProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isDoctor = session?.user?.role === 'DOCTOR'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">
            {patient.name} - {patient.gender} - {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* New Record Form */}
        <div className="lg:col-span-1">
          {isDoctor ? (
            <MedicalRecordForm patientId={patient.id} patientName={patient.name} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>New Record</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  Only doctors can create medical records
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Visit Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Visit Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.medicalRecords.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No visits recorded yet
                </p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {patient.medicalRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {format(new Date(record.visitDate), 'PPP')}
                          </p>
                        </div>
                        <Badge variant="outline">{record.doctor.name}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">Subjective</p>
                          <p>{record.subjective}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Objective</p>
                          <p>{record.objective}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Assessment</p>
                          <p>{record.assessment}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Plan</p>
                          <p>{record.plan}</p>
                        </div>
                      </div>

                      {record.prescription && (
                        <div className="border-t pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Pill className="h-4 w-4" />
                            <p className="font-medium">Prescription</p>
                            <Badge className={getStatusColor(record.prescription.status)}>
                              {record.prescription.status}
                            </Badge>
                          </div>
                          {record.prescription.items.length > 0 ? (
                            <div className="space-y-1">
                              {record.prescription.items.map((item, idx) => (
                                <p key={idx} className="text-sm">
                                  {item.medicine.name} - {item.dosage} x {item.quantity} {item.medicine.unit}
                                  {item.medicine.stockQty < item.quantity && (
                                    <Badge variant="destructive" className="ml-2">
                                      Low Stock
                                    </Badge>
                                  )}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No items added yet
                            </p>
                          )}
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => router.push(`/prescriptions/${record.prescription!.id}`)}
                          >
                            View Prescription
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
