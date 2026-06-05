import { PatientForm } from '@/components/forms/patient-form'

export default function NewPatientPage() {
  return (
    <div className="flex justify-center">
      <PatientForm mode="create" />
    </div>
  )
}
