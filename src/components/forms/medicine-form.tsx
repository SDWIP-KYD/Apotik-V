'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { medicineSchema, type MedicineInput } from '@/lib/validations'
import { createMedicine, updateMedicine } from '@/server/actions/medicines'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useState } from 'react'

interface MedicineFormProps {
  initialData?: {
    id: string
    name: string
    category: string
    unit: string
    stockQty: number
    minThreshold: number
    expiryDate: string
    price: number
  }
  mode?: 'create' | 'edit'
}

export function MedicineForm({ initialData, mode = 'create' }: MedicineFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          category: initialData.category,
          unit: initialData.unit,
          stockQty: initialData.stockQty,
          minThreshold: initialData.minThreshold,
          expiryDate: new Date(initialData.expiryDate),
          price: initialData.price,
        }
      : {
          name: '',
          category: '',
          unit: '',
          stockQty: 0,
          minThreshold: 10,
          expiryDate: new Date(),
          price: 0,
        },
  })

  const { register, handleSubmit, formState: { errors } } = form

  async function onSubmit(data: any) {
    setIsLoading(true)

    try {
      const result = initialData
        ? await updateMedicine(initialData.id, data as MedicineInput)
        : await createMedicine(data as MedicineInput)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(initialData ? 'Medicine updated' : 'Medicine created')
      router.push('/inventory')
      router.refresh()
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Add New Medicine' : 'Edit Medicine'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Enter medicine information below'
            : 'Update medicine information'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register('name')} disabled={isLoading} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select id="category" {...register('category')} disabled={isLoading} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select category</option>
                <option value="Tablet">Tablet</option>
                <option value="Kapsul">Kapsul</option>
                <option value="Sirup">Sirup</option>
                <option value="Drop">Drop</option>
                <option value="Topikal">Topikal</option>
                <option value="Suspensi">Suspensi</option>
                <option value="Injectable">Injectable</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <select id="unit" {...register('unit')} disabled={isLoading} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select unit</option>
                <option value="Tablet">Tablet</option>
                <option value="Kapsul">Kapsul</option>
                <option value="Botol">Botol</option>
                <option value="Tube">Tube</option>
                <option value="Ampul">Ampul</option>
                <option value="PCS">PCS</option>
                <option value="Strip">Strip</option>
                <option value="Box">Box</option>
                <option value="Sachet">Sachet</option>
              </select>
              {errors.unit && (
                <p className="text-sm text-red-500">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockQty">Stock Quantity *</Label>
              <Input id="stockQty" type="number" {...register('stockQty')} disabled={isLoading} />
              {errors.stockQty && (
                <p className="text-sm text-red-500">{errors.stockQty.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minThreshold">Min Threshold</Label>
              <Input id="minThreshold" type="number" {...register('minThreshold')} disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input id="price" type="number" {...register('price')} disabled={isLoading} />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input id="expiryDate" type="date" {...register('expiryDate')} disabled={isLoading} />
            {errors.expiryDate && (
              <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Medicine' : 'Update Medicine'}
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
