'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { deletePatient } from '@/server/actions/patients'
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Patient {
  id: string
  name: string
  medicalRecordNumber: string
  suku?: string | null
  dateOfBirth: string
  gender: string
  phone?: string | null
  allergies?: string | null
  createdAt: string
  createdBy: { id: string; name: string }
  _count: { medicalRecords: number; prescriptions: number }
  examinedToday: boolean
}

interface PatientListProps {
  initialPatients: Patient[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  search?: string
}

export function PatientList({ initialPatients, pagination, search: initialSearch }: PatientListProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [patients, setPatients] = useState(initialPatients)
  const [search, setSearch] = useState(initialSearch || '')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isDoctor = session?.user?.role === 'DOCTOR'

  async function handleDelete() {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const result = await deletePatient(deleteId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Patient deleted')
      setPatients(patients.filter((p) => p.id !== deleteId))
      router.refresh()
    } catch {
      toast.error('Failed to delete patient')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/patients?search=${encodeURIComponent(search)}`)
  }

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">
            {pagination.total} patient{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>No. RM</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Examined Today</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{patient.medicalRecordNumber}</TableCell>
                    <TableCell>{calculateAge(patient.dateOfBirth)} years</TableCell>
                    <TableCell>
                      <Badge variant={patient.gender === 'MALE' ? 'default' : 'secondary'}>
                        {patient.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>{patient.phone || '-'}</TableCell>
                    <TableCell>
                      {patient.allergies ? (
                        <Badge variant="destructive" className="max-w-[100px] truncate">
                          {patient.allergies}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{patient._count.medicalRecords}</TableCell>
                    <TableCell>
                      <Badge className={patient.examinedToday ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {patient.examinedToday ? '✓ Diperiksa' : 'Belum'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/patients/${patient.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isDoctor && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/patients/${patient.id}?edit=true`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(patient.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/patients?page=${pagination.page - 1}&search=${search}`)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/patients?page=${pagination.page + 1}&search=${search}`)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
