'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { getPrescriptionById, updatePrescriptionStatus, addPrescriptionItems, deletePrescriptionItem } from '@/server/actions/prescriptions'
import { format } from 'date-fns'
import { ArrowLeft, Check, X, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'

interface PrescriptionItem {
  id: string
  medicine: { id: string; name: string; stockQty: number; unit: string }
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

interface PrescriptionDetailProps {
  prescription: Prescription
}

export function PrescriptionDetail({ prescription: initialPrescription }: PrescriptionDetailProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [prescription, setPrescription] = useState(initialPrescription)
  const [isProcessing, setIsProcessing] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  const isDoctor = session?.user?.role === 'DOCTOR'
  const isPending = prescription.status === 'PENDING'

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

  async function handleStatusUpdate(newStatus: 'PROCESSED' | 'COMPLETED' | 'CANCELLED') {
    setIsProcessing(true)
    try {
      const result = await updatePrescriptionStatus(prescription.id, newStatus)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`Prescription ${newStatus.toLowerCase()}`)
      setPrescription({ ...prescription, status: newStatus })
      router.refresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleDeleteItem(itemId: string) {
    try {
      const result = await deletePrescriptionItem(itemId)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Item removed')
      setPrescription({
        ...prescription,
        items: prescription.items.filter((item) => item.id !== itemId),
      })
      router.refresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setDeleteItemId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/prescriptions" className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Prescription Detail</h1>
            <p className="text-muted-foreground">
              Created {format(new Date(prescription.createdAt), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPending && (
            <>
              <Button onClick={() => handleStatusUpdate('PROCESSED')} disabled={isProcessing}>
                <Check className="mr-2 h-4 w-4" />
                Process
              </Button>
              {isDoctor && (
                <Button variant="destructive" onClick={() => handleStatusUpdate('CANCELLED')} disabled={isProcessing}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </>
          )}
          {(prescription.status === 'PENDING' || prescription.status === 'PROCESSED') && (
            <Button onClick={() => handleStatusUpdate('COMPLETED')} disabled={isProcessing}>
              <Check className="mr-2 h-4 w-4" />
              Complete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {prescription.patient.name}</p>
            <p><strong>Created by:</strong> {prescription.createdBy.name}</p>
            {prescription.processedBy && (
              <p><strong>Processed by:</strong> {prescription.processedBy.name}</p>
            )}
            <div>
              <strong>Status:</strong>{' '}
              <Badge className={getStatusColor(prescription.status)}>
                {prescription.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescription Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Stock</TableHead>
                  {isPending && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescription.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isPending ? 5 : 4} className="text-center py-4">
                      No items in this prescription
                    </TableCell>
                  </TableRow>
                ) : (
                  prescription.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.medicine.name}</TableCell>
                      <TableCell>{item.dosage}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <span className={item.medicine.stockQty < item.quantity ? 'text-red-600' : ''}>
                          {item.medicine.stockQty} {item.medicine.unit}
                        </span>
                      </TableCell>
                      {isPending && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteItemId(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteItemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-2">Delete Item</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to remove this item from the prescription?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteItemId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteItem(deleteItemId)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
