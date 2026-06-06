'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema, type PatientInput } from '@/lib/validations'
import { createPatient, updatePatient, searchPatients } from '@/server/actions/patients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useState, useEffect, useRef } from 'react'
import { Search, UserCheck } from 'lucide-react'

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
    emergencyContactName?: string | null
    emergencyContactPhone?: string | null
    emergencyContactRelation?: string | null
    allergies?: string | null
  }
  mode?: 'create' | 'edit'
}

interface FoundPatient {
  id: string
  medicalRecordNumber: string
  name: string
  dateOfBirth: string | Date
  gender: string
  suku: string | null
  phone: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  emergencyContactRelation: string | null
  allergies: string | null
}

export function PatientForm({ initialData, mode = 'create' }: PatientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FoundPatient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [foundPatient, setFoundPatient] = useState<FoundPatient | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

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
          emergencyContactName: initialData.emergencyContactName ?? '',
          emergencyContactPhone: initialData.emergencyContactPhone ?? '',
          emergencyContactRelation: initialData.emergencyContactRelation ?? '',
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
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: '',
          allergies: '',
        },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form

  useEffect(() => {
    if (mode !== 'create') return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    debounceRef.current = setTimeout(async () => {
      const result = await searchPatients(searchQuery)
      if (result.data) {
        setSearchResults(result.data)
        setShowDropdown(true)
      }
      setIsSearching(false)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, mode])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectPatient(patient: FoundPatient) {
    setFoundPatient(patient)
    setValue('name', patient.name)
    setValue('dateOfBirth', new Date(patient.dateOfBirth))
    setValue('gender', patient.gender as 'MALE' | 'FEMALE')
    setValue('suku', patient.suku ?? '')
    setValue('phone', patient.phone ?? '')
    setValue('address', patient.address ?? '')
    setValue('emergencyContactName', patient.emergencyContactName ?? '')
    setValue('emergencyContactPhone', patient.emergencyContactPhone ?? '')
    setValue('emergencyContactRelation', patient.emergencyContactRelation ?? '')
    setValue('allergies', patient.allergies ?? '')
    setSearchQuery('')
    setShowDropdown(false)
    toast.success(`Patient "${patient.name}" found - No. RM: ${patient.medicalRecordNumber}`)
  }

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
    } catch (e) {
      console.error('Create patient error:', e)
      toast.error(e instanceof Error ? e.message : 'An error occurred')
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
            ? foundPatient
              ? `Editing existing patient - No. RM: ${foundPatient.medicalRecordNumber}`
              : 'Search existing patient or fill form for new patient'
            : `No. RM: ${initialData?.medicalRecordNumber || '-'}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === 'create' && (
          <>
            {foundPatient && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Existing patient loaded: <strong>{foundPatient.name}</strong> (No. RM: {foundPatient.medicalRecordNumber})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFoundPatient(null)
                    form.reset({
                      medicalRecordNumber: '', name: '', dateOfBirth: new Date(),
                      gender: 'MALE', suku: '', phone: '', address: '',
                      emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
                      allergies: '',
                    })
                  }}
                >
                  Clear
                </Button>
              </div>
            )}

            <div className="relative mb-4" ref={searchRef}>
              <Label>Search Existing Patient</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or No. RM to find existing patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  className="pl-9"
                  disabled={isLoading}
                />
                {isSearching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    Searching...
                  </span>
                )}
              </div>
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => selectPatient(patient)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            No. RM: {patient.medicalRecordNumber} · {patient.gender} · {patient.suku || '-'}
                          </p>
                        </div>
                        <Badge variant="outline">{patient.gender}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
                  No patients found — fill form below for new patient
                </div>
              )}
            </div>
          </>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register('name')} disabled={isLoading} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} disabled={isLoading} />
              {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                {...register('gender')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="suku">Suku / Ethnicity</Label>
              <Input id="suku" {...register('suku')} placeholder="e.g. Jawa, Sunda, Bugis" disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} disabled={isLoading} />
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

          <div className="space-y-2">
            <Label className="text-sm font-medium">Emergency Contact</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name</Label>
                <Input id="emergencyContactName" {...register('emergencyContactName')} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                <Input id="emergencyContactPhone" {...register('emergencyContactPhone')} disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="emergencyContactRelation">Relation</Label>
              <Input id="emergencyContactRelation" {...register('emergencyContactRelation')} placeholder="e.g. Spouse, Parent, Child" disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Input id="allergies" {...register('allergies')} placeholder="List any known allergies..." disabled={isLoading} />
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
