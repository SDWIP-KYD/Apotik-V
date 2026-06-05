import { MedicineForm } from '@/components/forms/medicine-form'

export default function NewMedicinePage() {
  return (
    <div className="flex justify-center">
      <MedicineForm mode="create" />
    </div>
  )
}
