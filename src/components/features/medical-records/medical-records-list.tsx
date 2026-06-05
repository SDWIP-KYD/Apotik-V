'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, FileText } from 'lucide-react'

interface Patient {
  id: string
  name: string
  medicalRecordNumber: string
  dateOfBirth: string
  gender: string
  phone?: string | null
  _count: { medicalRecords: number; prescriptions: number }
  examinedToday: boolean
}

interface MedicalRecordsListProps {
  initialPatients: Patient[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  search?: string
}

export function MedicalRecordsList({
  initialPatients,
  pagination,
  search: initialSearch,
}: MedicalRecordsListProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch || '')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/medical-records?search=${encodeURIComponent(search)}`)
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
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">
            Select a patient to view or add medical records
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients by name or phone..."
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
                <TableHead>Records</TableHead>
                <TableHead>Examined Today</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                initialPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.name}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {patient.medicalRecordNumber}
                    </TableCell>
                    <TableCell>
                      {calculateAge(patient.dateOfBirth)} years
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          patient.gender === 'MALE' ? 'default' : 'secondary'
                        }
                      >
                        {patient.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>{patient.phone || '-'}</TableCell>
                    <TableCell>{patient._count.medicalRecords}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          patient.examinedToday
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {patient.examinedToday ? 'Diperiksa' : 'Belum'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/medical-records/${patient.id}`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="mr-1 h-4 w-4" />
                          View Records
                        </Button>
                      </Link>
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
              onClick={() =>
                router.push(
                  `/medical-records?page=${pagination.page - 1}&search=${search}`
                )
              }
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  `/medical-records?page=${pagination.page + 1}&search=${search}`
                )
              }
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
