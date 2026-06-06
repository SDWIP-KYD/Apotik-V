'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '@/server/actions/medical-records'
import { updatePatient } from '@/server/actions/patients'
import { MedicineSearch } from '@/components/ui/medicine-search'
import { Icd10Search } from '@/components/ui/icd10-search'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ArrowLeft, Plus, Trash2, Copy, History, FileText, Save, Pencil, UserPen } from 'lucide-react'
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
  bloodPressureSystolic?: number | null
  bloodPressureDiastolic?: number | null
  temperature?: number | null
  heartRate?: number | null
  respiratoryRate?: number | null
  spo2?: number | null
  weight?: number | null
  height?: number | null
  diagnosisCode?: string | null
  doctor: { id: string; name: string }
  prescription?: {
    id: string
    status: string
    items: Array<{
      id: string
      medicineId: string
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
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  createdAt: string
  createdBy: { id: string; name: string }
  medicalRecords: MedicalRecordItem[]
}

interface PatientDetailProps {
  patient: Patient
}

export function PatientDetail({ patient }: PatientDetailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'new' | 'history'>(
    searchParams.get('tab') === 'history' ? 'history' : 'new'
  )
  const [isSaving, setIsSaving] = useState(false)

  const [subjective, setSubjective] = useState('')
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemData[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [medicineNames, setMedicineNames] = useState<Record<string, string>>({})
  const [editingRecord, setEditingRecord] = useState<MedicalRecordItem | null>(null)
  const [editSubjective, setEditSubjective] = useState('')
  const [editObjective, setEditObjective] = useState('')
  const [editAssessment, setEditAssessment] = useState('')
  const [editPlan, setEditPlan] = useState('')
  const [editBpSystolic, setEditBpSystolic] = useState('')
  const [editBpDiastolic, setEditBpDiastolic] = useState('')
  const [editTemperature, setEditTemperature] = useState('')
  const [editRespiratoryRate, setEditRespiratoryRate] = useState('')
  const [editHeartRate, setEditHeartRate] = useState('')
  const [editSpo2, setEditSpo2] = useState('')
  const [editWeight, setEditWeight] = useState('')
  const [editHeight, setEditHeight] = useState('')
  const [editDiagnosisCode, setEditDiagnosisCode] = useState('')
  const [editPrescriptionItems, setEditPrescriptionItems] = useState<PrescriptionItemData[]>([])
  const [editMedicineNames, setEditMedicineNames] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)

  // Edit patient identity
  const [editPatientOpen, setEditPatientOpen] = useState(false)
  const [editPatientSaving, setEditPatientSaving] = useState(false)
  const [epPhone, setEpPhone] = useState(patient.phone || '')
  const [epAddress, setEpAddress] = useState(patient.address || '')
  const [epSuku, setEpSuku] = useState(patient.suku || '')
  const [epDateOfBirth, setEpDateOfBirth] = useState(patient.dateOfBirth?.split('T')[0] || '')
  const [epGender, setEpGender] = useState(patient.gender || 'MALE')
  const [epAllergies, setEpAllergies] = useState(patient.allergies || '')
  const [epEmergencyName, setEpEmergencyName] = useState(patient.emergencyContactName || '')
  const [epEmergencyPhone, setEpEmergencyPhone] = useState(patient.emergencyContactPhone || '')
  const [epEmergencyRelation, setEpEmergencyRelation] = useState(patient.emergencyContactRelation || '')

  // Delete medical record
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null)

  // Vital signs
  const [bpSystolic, setBpSystolic] = useState('')
  const [bpDiastolic, setBpDiastolic] = useState('')
  const [temperature, setTemperature] = useState('')
  const [respiratoryRate, setRespiratoryRate] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [spo2, setSpo2] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [diagnosisCode, setDiagnosisCode] = useState('')

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

  function checkAllergies(): string[] {
    if (!patient.allergies) return []
    const allergyKeywords = patient.allergies.split(',').map(a => a.trim().toLowerCase()).filter(Boolean)
    const matches: string[] = []
    for (const item of prescriptionItems) {
      const medName = medicineNames[item.medicineId]
      if (!medName) continue
      const lowerName = medName.toLowerCase()
      for (const keyword of allergyKeywords) {
        if (lowerName.includes(keyword)) {
          matches.push(`${medName} (allergi: ${keyword})`)
        }
      }
    }
    return matches
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

  function startEditing(record: MedicalRecordItem) {
    setEditingRecord(record)
    setEditSubjective(record.subjective)
    setEditObjective(record.objective)
    setEditAssessment(record.assessment)
    setEditPlan(record.plan)
    setEditBpSystolic(record.bloodPressureSystolic?.toString() ?? '')
    setEditBpDiastolic(record.bloodPressureDiastolic?.toString() ?? '')
    setEditTemperature(record.temperature?.toString() ?? '')
    setEditRespiratoryRate(record.respiratoryRate?.toString() ?? '')
    setEditHeartRate(record.heartRate?.toString() ?? '')
    setEditSpo2(record.spo2?.toString() ?? '')
    setEditWeight(record.weight?.toString() ?? '')
    setEditHeight(record.height?.toString() ?? '')
    setEditDiagnosisCode(record.diagnosisCode ?? '')
    setEditPrescriptionItems(
      record.prescription?.items.map(item => ({
        medicineId: item.medicineId,
        dosage: item.dosage,
        quantity: item.quantity,
        notes: '',
      })) ?? []
    )
    setEditMedicineNames({})
  }

  async function handleSaveEdit() {
    if (!editingRecord) return
    if (!editSubjective.trim()) return toast.error('Subjective is required')
    if (!editObjective.trim()) return toast.error('Objective is required')
    if (!editAssessment.trim()) return toast.error('Assessment is required')
    if (!editPlan.trim()) return toast.error('Plan is required')

    setIsEditing(true)
    try {
      const result = await updateMedicalRecord(editingRecord.id, {
        patientId: patient.id,
        subjective: editSubjective,
        objective: editObjective,
        assessment: editAssessment,
        plan: editPlan,
        bloodPressureSystolic: editBpSystolic ? parseInt(editBpSystolic) : null,
        bloodPressureDiastolic: editBpDiastolic ? parseInt(editBpDiastolic) : null,
        temperature: editTemperature ? parseFloat(editTemperature) : null,
        respiratoryRate: editRespiratoryRate ? parseInt(editRespiratoryRate) : null,
        heartRate: editHeartRate ? parseInt(editHeartRate) : null,
        spo2: editSpo2 ? parseInt(editSpo2) : null,
        weight: editWeight ? parseFloat(editWeight) : null,
        height: editHeight ? parseFloat(editHeight) : null,
        diagnosisCode: editDiagnosisCode || null,
        prescriptionItems: editPrescriptionItems.filter(item => item.medicineId && item.quantity > 0),
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Medical record updated successfully')
      setEditingRecord(null)
      router.refresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsEditing(false)
    }
  }

  async function handleSavePatient() {
    setEditPatientSaving(true)
    try {
      const result = await updatePatient(patient.id, {
        name: patient.name,
        dateOfBirth: new Date(epDateOfBirth || patient.dateOfBirth),
        gender: epGender as 'MALE' | 'FEMALE',
        suku: epSuku || undefined,
        phone: epPhone || undefined,
        address: epAddress || undefined,
        emergencyContactName: epEmergencyName || undefined,
        emergencyContactPhone: epEmergencyPhone || undefined,
        emergencyContactRelation: epEmergencyRelation || undefined,
        allergies: epAllergies || undefined,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Patient data updated')
      setEditPatientOpen(false)
      router.refresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setEditPatientSaving(false)
    }
  }

  async function handleDeleteRecord() {
    if (!deleteRecordId) return
    try {
      const result = await deleteMedicalRecord(deleteRecordId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Medical record deleted')
      setDeleteRecordId(null)
      router.refresh()
    } catch {
      toast.error('An error occurred')
    }
  }

  async function handleFinal() {
    if (!subjective.trim()) return toast.error('Subjective is required')
    if (!objective.trim()) return toast.error('Objective is required')
    if (!assessment.trim()) return toast.error('Assessment is required')
    if (!plan.trim()) return toast.error('Plan is required')

    const validItems = prescriptionItems.filter((item) => item.medicineId && item.quantity > 0)

    const allergyMatches = checkAllergies()
    if (allergyMatches.length > 0) {
      toast.error(`Peringatan alergi: ${allergyMatches.join(', ')}`, { duration: 8000 })
    }

    setIsSaving(true)
    try {
      const result = await createMedicalRecord({
        patientId: patient.id,
        subjective,
        objective,
        assessment,
        plan,
        bloodPressureSystolic: bpSystolic ? parseInt(bpSystolic) : null,
        bloodPressureDiastolic: bpDiastolic ? parseInt(bpDiastolic) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        spo2: spo2 ? parseInt(spo2) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        diagnosisCode: diagnosisCode || null,
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
      setBpSystolic('')
      setBpDiastolic('')
      setTemperature('')
      setRespiratoryRate('')
      setHeartRate('')
      setSpo2('')
      setWeight('')
      setHeight('')
      setDiagnosisCode('')
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEpPhone(patient.phone || '')
            setEpAddress(patient.address || '')
            setEpSuku(patient.suku || '')
            setEpDateOfBirth(patient.dateOfBirth?.split('T')[0] || '')
            setEpGender(patient.gender || 'MALE')
            setEpAllergies(patient.allergies || '')
            setEpEmergencyName(patient.emergencyContactName || '')
            setEpEmergencyPhone(patient.emergencyContactPhone || '')
            setEpEmergencyRelation(patient.emergencyContactRelation || '')
            setEditPatientOpen(true)
          }}
        >
          <UserPen className="mr-1 h-3 w-3" />
          Edit Medical Record
        </Button>
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
            {patient.emergencyContactName && (
              <div>
                <span className="text-muted-foreground">Kontak Darurat: </span>
                <span className="font-medium">
                  {patient.emergencyContactName}
                  {patient.emergencyContactPhone && ` (${patient.emergencyContactPhone})`}
                  {patient.emergencyContactRelation && ` - ${patient.emergencyContactRelation}`}
                </span>
              </div>
            )}
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
        <div className="grid gap-6 lg:grid-cols-3 overflow-visible">
          {/* SOAP Form */}
          <div className="lg:col-span-2 space-y-4 overflow-visible">
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

            {/* Vital Signs */}
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle>Tanda Vital</CardTitle>
                <CardDescription>Pengukuran klinis terstruktur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">TD Sistolik</Label>
                    <Input type="number" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)} placeholder="120" min={60} max={300} disabled={isSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">TD Diastolik</Label>
                    <Input type="number" value={bpDiastolic} onChange={(e) => setBpDiastolic(e.target.value)} placeholder="80" min={30} max={200} disabled={isSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Suhu (°C)</Label>
                    <Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="36.5" step={0.1} min={30} max={45} disabled={isSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">HR (x/mnt)</Label>
                    <Input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="80" min={30} max={300} disabled={isSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">RR (x/mnt)</Label>
                    <Input type="number" value={respiratoryRate} onChange={(e) => setRespiratoryRate(e.target.value)} placeholder="20" min={5} max={60} disabled={isSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SpO2 (%)</Label>
                    <Input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="98" min={0} max={100} disabled={isSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">BB (kg)</Label>
                    <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" step={0.1} min={0} max={500} disabled={isSaving} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">TB (cm)</Label>
                    <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" step={0.1} min={0} max={300} disabled={isSaving} />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Kode Diagnosis (ICD-10)</Label>
                  <Icd10Search
                    value={diagnosisCode}
                    onChange={(code) => setDiagnosisCode(code)}
                    disabled={isSaving}
                    placeholder="Cari kode atau nama diagnosis..."
                  />
                </div>
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
          <div className="space-y-4 overflow-visible">
            <Card className="overflow-visible">
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
              <CardContent className="space-y-3 overflow-visible">
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
                          onChange={(id, name) => {
                            updatePrescriptionItem(index, 'medicineId', id)
                            if (id && name) {
                              setMedicineNames(prev => ({ ...prev, [id]: name }))
                              if (patient.allergies) {
                                const allergyKeywords = patient.allergies.split(',').map(a => a.trim().toLowerCase()).filter(Boolean)
                                const lowerName = name.toLowerCase()
                                for (const keyword of allergyKeywords) {
                                  if (lowerName.includes(keyword)) {
                                    toast.warning(`Peringatan: ${name} cocok dengan alergi pasien (${keyword})`, { duration: 6000 })
                                    break
                                  }
                                }
                              }
                            }
                          }}
                          disabled={isSaving}
                          placeholder="Search medicine by name..."
                        />
                        {item.medicineId && (
                          <>
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
                          </>
                        )}
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
              <Card key={record.id} className="overflow-visible">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(record)}
                        disabled={editingRecord?.id === record.id}
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      {session?.user?.role === 'DOCTOR' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteRecordId(record.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3 text-red-500" />
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingRecord?.id === record.id ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Subjective</Label>
                          <textarea
                            value={editSubjective}
                            onChange={(e) => setEditSubjective(e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            disabled={isEditing}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Objective</Label>
                          <textarea
                            value={editObjective}
                            onChange={(e) => setEditObjective(e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            disabled={isEditing}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Assessment</Label>
                          <textarea
                            value={editAssessment}
                            onChange={(e) => setEditAssessment(e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            disabled={isEditing}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Plan</Label>
                          <textarea
                            value={editPlan}
                            onChange={(e) => setEditPlan(e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            disabled={isEditing}
                          />
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <p className="text-sm font-medium text-muted-foreground mb-1">Tanda Vital</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">TD Sistolik</Label>
                          <Input type="number" value={editBpSystolic} onChange={(e) => setEditBpSystolic(e.target.value)} placeholder="120" min={60} max={300} disabled={isEditing} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">TD Diastolik</Label>
                          <Input type="number" value={editBpDiastolic} onChange={(e) => setEditBpDiastolic(e.target.value)} placeholder="80" min={30} max={200} disabled={isEditing} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Suhu (°C)</Label>
                          <Input type="number" value={editTemperature} onChange={(e) => setEditTemperature(e.target.value)} placeholder="36.5" step={0.1} min={30} max={45} disabled={isEditing} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">HR (x/mnt)</Label>
                          <Input type="number" value={editHeartRate} onChange={(e) => setEditHeartRate(e.target.value)} placeholder="80" min={30} max={300} disabled={isEditing} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">RR (x/mnt)</Label>
                          <Input type="number" value={editRespiratoryRate} onChange={(e) => setEditRespiratoryRate(e.target.value)} placeholder="20" min={5} max={60} disabled={isEditing} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">SpO2 (%)</Label>
                          <Input type="number" value={editSpo2} onChange={(e) => setEditSpo2(e.target.value)} placeholder="98" min={0} max={100} disabled={isEditing} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">BB (kg)</Label>
                          <Input type="number" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} placeholder="70" step={0.1} min={0} max={500} disabled={isEditing} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">TB (cm)</Label>
                          <Input type="number" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} placeholder="170" step={0.1} min={0} max={300} disabled={isEditing} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-xs">Kode Diagnosis (ICD-10)</Label>
                        <Icd10Search
                          value={editDiagnosisCode}
                          onChange={(code) => setEditDiagnosisCode(code)}
                          disabled={isEditing}
                          placeholder="Cari kode atau nama diagnosis..."
                        />
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Resep Obat</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditPrescriptionItems([
                            ...editPrescriptionItems,
                            { medicineId: '', dosage: '1 tablet 3x sehari', quantity: 10, notes: '' },
                          ])}
                          disabled={isEditing}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add
                        </Button>
                      </div>
                      {editPrescriptionItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Belum ada obat
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {editPrescriptionItems.map((item, index) => (
                            <div key={index} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                  #{index + 1}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setEditPrescriptionItems(editPrescriptionItems.filter((_, i) => i !== index))}
                                  disabled={isEditing}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                              <MedicineSearch
                                value={item.medicineId}
                                onChange={(id, name) => {
                                  const updated = [...editPrescriptionItems]
                                  updated[index] = { ...updated[index], medicineId: id }
                                  setEditPrescriptionItems(updated)
                                  if (id && name) {
                                    setEditMedicineNames(prev => ({ ...prev, [id]: name }))
                                  }
                                }}
                                disabled={isEditing}
                                placeholder="Search medicine..."
                              />
                              {item.medicineId && (
                                <>
                                  <Input
                                    value={item.dosage}
                                    onChange={(e) => {
                                      const updated = [...editPrescriptionItems]
                                      updated[index] = { ...updated[index], dosage: e.target.value }
                                      setEditPrescriptionItems(updated)
                                    }}
                                    placeholder="Dosage: 1 tablet 3x sehari"
                                    disabled={isEditing}
                                  />
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const updated = [...editPrescriptionItems]
                                      updated[index] = { ...updated[index], quantity: parseInt(e.target.value) || 0 }
                                      setEditPrescriptionItems(updated)
                                    }}
                                    placeholder="Qty"
                                    min={1}
                                    className="w-24"
                                    disabled={isEditing}
                                  />
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingRecord(null)}
                          disabled={isEditing}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={isEditing}
                        >
                          <Save className="mr-1 h-3 w-3" />
                          {isEditing ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                      {(record.bloodPressureSystolic != null && record.bloodPressureDiastolic != null) ||
                        record.temperature != null || record.heartRate != null ||
                        record.respiratoryRate != null || record.diagnosisCode ||
                        record.spo2 != null || record.weight != null || record.height != null ? (
                        <div>
                          <Separator className="my-2" />
                          <p className="text-sm font-medium text-muted-foreground mb-1">Tanda Vital</p>
                          <div className="flex flex-wrap gap-3 text-sm">
                            {record.bloodPressureSystolic != null && record.bloodPressureDiastolic != null && (
                              <span>TD: {record.bloodPressureSystolic}/{record.bloodPressureDiastolic} mmHg</span>
                            )}
                            {record.temperature != null && (
                              <span>Suhu: {record.temperature}&deg;C</span>
                            )}
                            {record.heartRate != null && (
                              <span>HR: {record.heartRate} bpm</span>
                            )}
                            {record.respiratoryRate != null && (
                              <span>RR: {record.respiratoryRate} /min</span>
                            )}
                            {record.spo2 != null && (
                              <span>SpO2: {record.spo2}%</span>
                            )}
                            {record.weight != null && (
                              <span>BB: {record.weight} kg</span>
                            )}
                            {record.height != null && (
                              <span>TB: {record.height} cm</span>
                            )}
                            {record.diagnosisCode && (
                              <span>DX: {record.diagnosisCode}</span>
                            )}
                          </div>
                        </div>
                      ) : null}
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
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Patient Identity Dialog */}
      <Dialog open={editPatientOpen} onOpenChange={setEditPatientOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medical Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Tanggal Lahir</Label>
              <Input type="date" value={epDateOfBirth} onChange={(e) => setEpDateOfBirth(e.target.value)} disabled={editPatientSaving} />
            </div>
            <div className="space-y-1">
              <Label>Jenis Kelamin</Label>
              <select
                value={epGender}
                onChange={(e) => setEpGender(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={editPatientSaving}
              >
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>No. HP</Label>
              <Input value={epPhone} onChange={(e) => setEpPhone(e.target.value)} placeholder="08xxx" disabled={editPatientSaving} />
            </div>
            <div className="space-y-1">
              <Label>Alamat</Label>
              <textarea
                value={epAddress}
                onChange={(e) => setEpAddress(e.target.value)}
                placeholder="Alamat lengkap"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={editPatientSaving}
              />
            </div>
            <div className="space-y-1">
              <Label>Suku</Label>
              <Input value={epSuku} onChange={(e) => setEpSuku(e.target.value)} placeholder="Jawa, Sunda, dll" disabled={editPatientSaving} />
            </div>
            <div className="space-y-1">
              <Label>Alergi</Label>
              <Input value={epAllergies} onChange={(e) => setEpAllergies(e.target.value)} placeholder="Contoh: aspirin, ibuprofen" disabled={editPatientSaving} />
            </div>
            <Separator />
            <p className="text-sm font-medium text-muted-foreground">Kontak Darurat</p>
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input value={epEmergencyName} onChange={(e) => setEpEmergencyName(e.target.value)} placeholder="Nama kontak darurat" disabled={editPatientSaving} />
            </div>
            <div className="space-y-1">
              <Label>No. HP</Label>
              <Input value={epEmergencyPhone} onChange={(e) => setEpEmergencyPhone(e.target.value)} placeholder="08xxx" disabled={editPatientSaving} />
            </div>
            <div className="space-y-1">
              <Label>Hubungan</Label>
              <Input value={epEmergencyRelation} onChange={(e) => setEpEmergencyRelation(e.target.value)} placeholder="Istri, Suami, Orang Tua, dll" disabled={editPatientSaving} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPatientOpen(false)} disabled={editPatientSaving}>Cancel</Button>
            <Button onClick={handleSavePatient} disabled={editPatientSaving}>
              <Save className="mr-1 h-3 w-3" />
              {editPatientSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Record Confirmation */}
      {deleteRecordId && (
        <Dialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Rekam Medis</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus rekam medis ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteRecordId(null)}>Batal</Button>
              <Button variant="destructive" onClick={handleDeleteRecord}>Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
