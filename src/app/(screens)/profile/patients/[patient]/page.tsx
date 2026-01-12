import PatientForm from '@/components/Patients/PatientForm'
import React from 'react'

const page = ({ params }: any) => {
  const patient = params?.patient
  return (
    <div>
      <PatientForm patient={patient} />
    </div>
  )
}

export default page
