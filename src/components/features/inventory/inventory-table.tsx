'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { deleteMedicine, adjustStock } from '@/server/actions/medicines'
import { Search, Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'

interface Medicine {
  id: string
  name: string
  category: string
  unit: string
  stockQty: number
  minThreshold: number
  expiryDate: string
  batchNumber: string
  price: number
}

interface InventoryTableProps {
  initialMedicines: Medicine[]
  categories: string[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  search?: string
  category?: string
}

export function InventoryTable({
  initialMedicines,
  categories,
  pagination,
  search: initialSearch,
  category: initialCategory,
}: InventoryTableProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [medicines, setMedicines] = useState(initialMedicines)
  const [search, setSearch] = useState(initialSearch || '')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [adjustId, setAdjustId] = useState<string | null>(null)
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustReason, setAdjustReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const isDoctor = session?.user?.role === 'DOCTOR'

  function isLowStock(medicine: Medicine) {
    return medicine.stockQty <= medicine.minThreshold
  }

  function isNearExpiry(medicine: Medicine) {
    const expiry = new Date(medicine.expiryDate)
    const now = new Date()
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)
    return expiry <= thirtyDays
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  async function handleDelete() {
    if (!deleteId) return

    setIsProcessing(true)
    try {
      const result = await deleteMedicine(deleteId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Medicine deleted')
      setMedicines(medicines.filter((m) => m.id !== deleteId))
      router.refresh()
    } catch {
      toast.error('Failed to delete medicine')
    } finally {
      setIsProcessing(false)
      setDeleteId(null)
    }
  }

  async function handleAdjustStock() {
    if (!adjustId || adjustQty === 0) return

    setIsProcessing(true)
    try {
      const result = await adjustStock({
        medicineId: adjustId,
        quantity: adjustQty,
        reason: adjustReason,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Stock adjusted')
      if (result.data) {
        setMedicines(
          medicines.map((m) =>
            m.id === adjustId ? { ...m, stockQty: result.data.stockQty } : m
          )
        )
      }
      router.refresh()
    } catch {
      toast.error('Failed to adjust stock')
    } finally {
      setIsProcessing(false)
      setAdjustId(null)
      setAdjustQty(0)
      setAdjustReason('')
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (selectedCategory) params.set('category', selectedCategory)
    router.push(`/inventory?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            {pagination.total} medicine{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Medicine
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <Button type="submit">Filter</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No medicines found
                  </TableCell>
                </TableRow>
              ) : (
                medicines.map((medicine) => (
                  <TableRow
                    key={medicine.id}
                    className={
                      isLowStock(medicine)
                        ? 'bg-red-50'
                        : isNearExpiry(medicine)
                        ? 'bg-yellow-50'
                        : ''
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isLowStock(medicine) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {isNearExpiry(medicine) && (
                          <Package className="h-4 w-4 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {medicine.batchNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{medicine.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            isLowStock(medicine) ? 'font-bold text-red-600' : ''
                          }
                        >
                          {medicine.stockQty} {medicine.unit}
                        </span>
                        {isLowStock(medicine) && (
                          <Badge variant="destructive">Low</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          isNearExpiry(medicine) ? 'font-bold text-yellow-600' : ''
                        }
                      >
                        {format(new Date(medicine.expiryDate), 'MMM yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(medicine.price)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setAdjustId(medicine.id)
                            setAdjustQty(0)
                            setAdjustReason('')
                          }}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/inventory/${medicine.id}?edit=true`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isDoctor && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(medicine.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams()
                if (search) params.set('search', search)
                if (selectedCategory) params.set('category', selectedCategory)
                params.set('page', String(pagination.page - 1))
                router.push(`/inventory?${params.toString()}`)
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
                if (search) params.set('search', search)
                if (selectedCategory) params.set('category', selectedCategory)
                params.set('page', String(pagination.page + 1))
                router.push(`/inventory?${params.toString()}`)
              }}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medicine record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isProcessing}>
              {isProcessing ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={!!adjustId} onOpenChange={() => setAdjustId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Add or reduce stock for this medicine. Use positive numbers to add, negative to reduce.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adjustQty">Quantity (use - for reduce)</Label>
              <Input
                id="adjustQty"
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustReason">Reason *</Label>
              <Input
                id="adjustReason"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g., Stock opname, Received delivery"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustId(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleAdjustStock}
              disabled={isProcessing || adjustQty === 0 || !adjustReason}
            >
              {isProcessing ? 'Saving...' : 'Adjust Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


