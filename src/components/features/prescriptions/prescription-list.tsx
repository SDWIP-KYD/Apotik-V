'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { updatePrescriptionStatus } from '@/server/actions/prescriptions'
import { Eye, Check, X, Clock, Loader2 } from 'lucide-react'
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
import { format } from 'date-fns'

interface PrescriptionItem {
  medicine: { name: string; stockQty: number; unit: string }
  dosage: string
  quantity: number
}

interface Prescription {
  id: string
  status: string
  createdAt: string
  patient: { id: string; name: string }
  createdBy: { id: string; name: string }
  processedBy?: { id: string; name: string } | null
  items: PrescriptionItem[]
}

interface PrescriptionListProps {
  initialPrescriptions: Prescription[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  status?: string
}

export function PrescriptionList({
  initialPrescriptions,
  pagination,
  status: initialStatus,
}: PrescriptionListProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions)
  const [statusFilter, setStatusFilter] = useState(initialStatus || '')
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'complete' | 'cancel' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

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

  async function handleAction() {
    if (!actionId || !actionType) return

    setIsProcessing(true)
    try {
      const newStatus = actionType === 'complete' ? 'COMPLETED' : 'CANCELLED'
      const result = await updatePrescriptionStatus(actionId, newStatus as any)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`Prescription ${actionType === 'complete' ? 'completed' : 'cancelled'}`)
      setPrescriptions(
        prescriptions.map((p) =>
          p.id === actionId ? { ...p, status: newStatus } : p
        )
      )
      router.refresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsProcessing(false)
      setActionId(null)
      setActionType(null)
    }
  }

  function handleFilter(newStatus: string) {
    setStatusFilter(newStatus)
    const params = new URLSearchParams()
    if (newStatus) params.set('status', newStatus)
    router.push(`/prescriptions?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">
            {pagination.total} prescription{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter('')}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter('PENDING')}
        >
          <Clock className="mr-2 h-4 w-4" />
          Pending
        </Button>
        <Button
          variant={statusFilter === 'PROCESSED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter('PROCESSED')}
        >
          <Loader2 className="mr-2 h-4 w-4" />
          Processed
        </Button>
        <Button
          variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter('COMPLETED')}
        >
          <Check className="mr-2 h-4 w-4" />
          Completed
        </Button>
        <Button
          variant={statusFilter === 'CANCELLED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter('CANCELLED')}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelled
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No prescriptions found
                  </TableCell>
                </TableRow>
              ) : (
                prescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell className="font-medium">
                      {prescription.patient.name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {prescription.items.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-sm">
                            {item.medicine.name} x {item.quantity}
                          </p>
                        ))}
                        {prescription.items.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{prescription.items.length - 2} more
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(prescription.createdAt), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell>{prescription.createdBy.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/prescriptions/${prescription.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {prescription.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setActionId(prescription.id)
                              setActionType('complete')
                            }}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {(prescription.status === 'PENDING' ||
                          prescription.status === 'PROCESSED') &&
                          isDoctor && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setActionId(prescription.id)
                                setActionType('cancel')
                              }}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
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
      <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams()
                if (statusFilter) params.set('status', statusFilter)
                params.set('page', String(pagination.page - 1))
                router.push(`/prescriptions?${params.toString()}`)
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
                if (statusFilter) params.set('status', statusFilter)
                params.set('page', String(pagination.page + 1))
                router.push(`/prescriptions?${params.toString()}`)
              }}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <AlertDialog open={!!actionId} onOpenChange={() => { setActionId(null); setActionType(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'complete' ? 'Complete Prescription' : 'Cancel Prescription'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'complete'
                ? 'This will deduct stock from inventory. Are you sure?'
                : 'This action cannot be undone. Are you sure?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isProcessing}
              className={actionType === 'cancel' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isProcessing ? 'Processing...' : actionType === 'complete' ? 'Complete' : 'Cancel Prescription'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
