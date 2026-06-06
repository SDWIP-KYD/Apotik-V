'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Search, FileText } from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
  medicalRecordNumber: string
  isActive: boolean
  _count: { medicalRecords: number }
  examinedToday: boolean
  lastVisit?: { visitDate: string; assessment: string } | null
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

export function MedicalRecordsList({ initialPatients, pagination, search: initialSearch }: MedicalRecordsListProps) {
  const router = useRouter()
  const [patients, setPatients] = useState(initialPatients)
  const [search, setSearch] = useState(initialSearch || '')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    router.push(`/medical-records?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rekam Medis</h1>
          <p className="text-muted-foreground">
            Semua pasien terdaftar
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, No. RM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Cari</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. RM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Jml Kunjungan</TableHead>
                <TableHead>Kunjungan Terakhir</TableHead>
                <TableHead>Diagnosis Terakhir</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Tidak ada pasien ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id} className={!patient.isActive ? 'opacity-60' : ''}>
                    <TableCell className="font-mono font-medium">{patient.medicalRecordNumber}</TableCell>
                    <TableCell className="font-medium">
                      {patient.name}
                      {!patient.isActive && (
                        <Badge variant="destructive" className="ml-2 text-xs">Dihapus</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.isActive ? 'default' : 'secondary'}>
                        {patient.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient._count.medicalRecords}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {patient.lastVisit
                        ? format(new Date(patient.lastVisit.visitDate), 'dd MMM yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {patient.lastVisit?.assessment || '-'}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/patients/${patient.id}?tab=history`}
                        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                      >
                        <FileText className="mr-1 h-4 w-4" />
                        Lihat
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
            Halaman {pagination.page} dari {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/medical-records?${(() => { const p = new URLSearchParams(); if (search) p.set('search', search); p.set('page', String(pagination.page - 1)); return p.toString(); })()}`}
              className={`${buttonVariants({ variant: "outline", size: "sm" })} ${pagination.page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              Sebelumnya
            </Link>
            <Link
              href={`/medical-records?${(() => { const p = new URLSearchParams(); if (search) p.set('search', search); p.set('page', String(pagination.page + 1)); return p.toString(); })()}`}
              className={`${buttonVariants({ variant: "outline", size: "sm" })} ${pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}`}
            >
              Selanjutnya
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
