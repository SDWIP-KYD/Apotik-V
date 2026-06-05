'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  oldValues: any
  newValues: any
  timestamp: string
  user: { id: string; name: string; email: string }
}

interface AuditLogListProps {
  initialLogs: AuditLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  entity?: string
}

export function AuditLogList({
  initialLogs,
  pagination,
  entity: initialEntity,
}: AuditLogListProps) {
  const router = useRouter()
  const [logs] = useState(initialLogs)
  const [entityFilter, setEntityFilter] = useState(initialEntity || '')

  function getActionColor(action: string) {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getEntityColor(entity: string) {
    switch (entity) {
      case 'Patient':
        return 'bg-purple-100 text-purple-800'
      case 'MedicalRecord':
        return 'bg-indigo-100 text-indigo-800'
      case 'Medicine':
        return 'bg-orange-100 text-orange-800'
      case 'Prescription':
        return 'bg-cyan-100 text-cyan-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function handleFilter(newEntity: string) {
    setEntityFilter(newEntity)
    const params = new URLSearchParams()
    if (newEntity) params.set('entity', newEntity)
    router.push(`/audit-logs?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            {pagination.total} log{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={entityFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter('')}
        >
          All
        </Button>
        <Button
          variant={entityFilter === 'Patient' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter('Patient')}
        >
          Patients
        </Button>
        <Button
          variant={entityFilter === 'MedicalRecord' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter('MedicalRecord')}
        >
          Medical Records
        </Button>
        <Button
          variant={entityFilter === 'Medicine' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter('Medicine')}
        >
          Medicines
        </Button>
        <Button
          variant={entityFilter === 'Prescription' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter('Prescription')}
        >
          Prescriptions
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {                      format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.user.name}</p>
                        <p className="text-xs text-muted-foreground">{log.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEntityColor(log.entity)}>
                        {log.entity}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.entityId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate">
                        {log.action === 'DELETE' && log.oldValues && (
                          <span className="text-red-600">Deleted</span>
                        )}
                        {log.action === 'CREATE' && log.newValues && (
                          <span className="text-green-600">Created</span>
                        )}
                        {log.action === 'UPDATE' && (
                          <span className="text-blue-600">Updated</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/audit-logs/${log.id}`} className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted">
                          <Eye className="h-4 w-4" />
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
              onClick={() => {
                const params = new URLSearchParams()
                if (entityFilter) params.set('entity', entityFilter)
                params.set('page', String(pagination.page - 1))
                router.push(`/audit-logs?${params.toString()}`)
              }}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams()
                if (entityFilter) params.set('entity', entityFilter)
                params.set('page', String(pagination.page + 1))
                router.push(`/audit-logs?${params.toString()}`)
              }}
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
