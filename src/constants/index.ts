export const consultationTypeMeaning: any = {
  doctorConsultation: 'Doctor consultation requested',
  uploadPrescription: 'Prescription Uploaded'
}

export const consultationStatusMeaning: any = {
  prescription_under_review: 'Prescription Under Review',
  prescription_declined: 'Prescription Declined',
  doctor_will_call: 'Our expert team will reach out to you soon',
  ready_for_order: 'Ready For Order'
}

export const uploadGuidelineKeys: string[] = [
  'guideline_do_not_crop_prescription',
  'guideline_avoid_blurred_images',
  'guideline_include_details',
  'guideline_supported_files',
  'guideline_file_size_limit'
]

export const prescriptionConfirmationOptions: any = [
  {
    type: 'search',
    titleKey: 'search_add_medicines',
    descriptionKey: 'manual_search_add_cart',
    image: 'Basket'
  },
  {
    type: 'call',
    titleKey: 'get_call_from_davaindia',
    descriptionKey: 'call_to_confirm_medicines',
    image: 'Call'
  }
]

export const davaOneMembershipAmount = 99

export const DELIVERY_MODES = {
  STANDARD: 'standard',
  ONE_DAY: 'oneDay'
}
