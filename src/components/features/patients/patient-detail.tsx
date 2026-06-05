'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { createMedicalRecord } from '@/server/actions/medical-records'
import { MedicineSearch } from '@/components/ui/medicine-search'
import { ArrowLeft, Plus, Trash2, Copy, History, FileText, Save } from 'lucide-react'
import { format } from 'date-fns'

interface PrescriptionItemData {
  medicineId: string
  dosage: string
  quantity: number
  notes: string
}

interface MedicalRecordItem {
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
  medicalRecordNumber: string
  suku?: string | null
  dateOfBirth: string
  gender: string
  phone?: string | null
  address?: string | null
  allergies?: string | null
  createdAt: string
  createdBy: { id: string; name: string }
  medicalRecords: MedicalRecordItem[]
}

interface PatientDetailProps {
  patient: Patient
}

export function PatientDetail({ patient }: PatientDetailProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new')
  const [isSaving, setIsSaving] = useState(false)

  const [subjective, setSubjective] = useState('')
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemData[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const today = new Date()
  const examinedToday = patient.medicalRecords.some((r) => {
    const visitDate = new Date(r.visitDate)
    return visitDate.toDateString() === today.toDateString()
  })

  const filteredRecords = patient.medicalRecords.filter((record) => {
    const visitDate = new Date(record.visitDate)
    if (dateFrom && visitDate < new Date(dateFrom)) return false
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      if (visitDate > to) return false
    }
    return true
  })

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
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function addPrescriptionItem() {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicineId: '', dosage: '1 tablet 3x sehari', quantity: 10, notes: '' },
    ])
  }

  function removePrescriptionItem(index: number) {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index))
  }

  function updatePrescriptionItem(index: number, field: keyof PrescriptionItemData, value: string | number) {
    const updated = [...prescriptionItems]
    updated[index] = { ...updated[index], [field]: value }
    setPrescriptionItems(updated)
  }

  function copyFromRecord(record: MedicalRecordItem) {
    setSubjective(record.subjective)
    setObjective(record.objective)
    setAssessment(record.assessment)
    setPlan(record.plan)

    if (record.prescription?.items) {
      setPrescriptionItems(
        record.prescription.items.map((item) => ({
          medicineId: '',
          dosage: item.dosage,
          quantity: item.quantity,
          notes: '',
        }))
      )
    }

    setActiveTab('new')
    toast.success('Data from previous visit copied')
  }

  async function handleFinal() {
    if (!subjective.trim()) return toast.error('Subjective is required')
    if (!objective.trim()) return toast.error('Objective is required')
    if (!assessment.trim()) return toast.error('Assessment is required')
    if (!plan.trim()) return toast.error('Plan is required')

    const validItems = prescriptionItems.filter((item) => item.medicineId && item.quantity > 0)

    setIsSaving(true)
    try {
      const result = await createMedicalRecord({
        patientId: patient.id,
        subjective,
        objective,
        assessment,
        plan,
        prescriptionItems: validItems.length > 0 ? validItems : undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Medical record saved successfully')
      setSubjective('')
      setObjective('')
      setAssessment('')
      setPlan('')
      setPrescriptionItems([])
      router.refresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">
              No. RM: {patient.medicalRecordNumber}
            </p>
            <p className="text-muted-foreground">
              {calculateAge(patient.dateOfBirth)} years old · {patient.gender}
              {patient.allergies && (
                <span className="ml-2">
                  <Badge variant="destructive">Allergy: {patient.allergies}</Badge>
                </span>
              )}
              {examinedToday && (
                <span className="ml-2">
                  <Badge className="bg-green-100 text-green-800">Sudah Diperiksa Hari Ini</Badge>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Patient Info Bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Phone: </span>
              <span className="font-medium">{patient.phone || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Address: </span>
              <span className="font-medium">{patient.address || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Registered by: </span>
              <span className="font-medium">{patient.createdBy.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Suku: </span>
              <span className="font-medium">{patient.suku || '-'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'new' ? 'default' : 'outline'}
          onClick={() => setActiveTab('new')}
        >
          <FileText className="mr-2 h-4 w-4" />
          New Visit
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
        >
          <History className="mr-2 h-4 w-4" />
          History ({patient.medicalRecords.length})
        </Button>
      </div>

      {/* New Visit Form */}
      {activeTab === 'new' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* SOAP Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subjective (S)</CardTitle>
                <CardDescription>Patient complaints, symptoms, history</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  placeholder="Pasien mengeluh..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Objective (O)</CardTitle>
                <CardDescription>Vital signs, physical examination</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="TD: 120/80 mmHg, S: 36.5C..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assessment (A)</CardTitle>
                <CardDescription>Diagnosis, clinical impression</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="Diagnosis..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan (P)</CardTitle>
                <CardDescription>Treatment plan, medications, follow-up</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Perawatan, obat, kontrol..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving}
                />
              </CardContent>
            </Card>
          </div>

          {/* Prescription Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Prescription</CardTitle>
                  <Button size="sm" onClick={addPrescriptionItem} disabled={isSaving}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                <CardDescription>Select medicines from inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {prescriptionItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No medicines added yet
                  </p>
                ) : (
                  prescriptionItems.map((item, index) => {
                    return (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removePrescriptionItem(index)}
                            disabled={isSaving}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                        <MedicineSearch
                          value={item.medicineId}
                          onChange={(id) => updatePrescriptionItem(index, 'medicineId', id)}
                          disabled={isSaving}
                          placeholder="Search medicine by name..."
                        />
                        <Input
                          value={item.dosage}
                          onChange={(e) => updatePrescriptionItem(index, 'dosage', e.target.value)}
                          placeholder="Dosage: 1 tablet 3x sehari"
                          disabled={isSaving}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updatePrescriptionItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            placeholder="Qty"
                            min={1}
                            className="w-20"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Final Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleFinal}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Final - Save Record'}
            </Button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="space-y-1">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setDateFrom(''); setDateTo('') }}
              >
                Clear Filter
              </Button>
            )}
          </div>
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  {patient.medicalRecords.length === 0 ? 'No visit history yet' : 'No records match the selected date range'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {format(new Date(record.visitDate), 'EEEE, dd MMMM yyyy')}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{record.doctor.name}</Badge>
                      {record.prescription && (
                        <Badge className={getStatusColor(record.prescription.status)}>
                          {record.prescription.status}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyFromRecord(record)}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy to New Visit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Subjective</p>
                      <p className="text-sm">{record.subjective}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Objective</p>
                      <p className="text-sm">{record.objective}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Assessment</p>
                      <p className="text-sm font-medium">{record.assessment}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Plan</p>
                      <p className="text-sm">{record.plan}</p>
                    </div>
                  </div>
                  {record.prescription && record.prescription.items.length > 0 && (
                    <div>
                      <Separator className="my-2" />
                      <p className="text-sm font-medium text-muted-foreground mb-1">Prescription</p>
                      <div className="space-y-1">
                        {record.prescription.items.map((item, idx) => (
                          <p key={idx} className="text-sm">
                            · {item.medicine.name} — {item.dosage} × {item.quantity} {item.medicine.unit}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
