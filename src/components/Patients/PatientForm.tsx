'use client'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { patientsSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import FormReactDatePicker from '../Form/FormReactDatePicker'
import {
  createUserPatient,
  fetchUserPatient,
  patchUserPatient
} from '@/utils/actions/patientsActions'
import usePatientsStore from '@/store/userPatientStore'
import FormRadioButton from '../Form/FormRadioButton'
import FormSelectField from '../Form/FormSelectField'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PatientForm = ({ patient }: any) => {
  const router = useRouter()

  const { fetchPatients } = usePatientsStore(state => state)
  const [loading, setLoading] = useState(true)

  const form = useForm<z.infer<typeof patientsSchema>>({
    resolver: zodResolver(patientsSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      relation: '',
      dateOfBirth: null,
      gender: 'male'
    }
  })

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (patient !== 'new') {
        try {
          const data = await fetchUserPatient(patient)
          form.reset({
            name: data.name ?? '',
            phoneNumber: data.phoneNumber ?? '',
            email: data.email ?? '',
            relation: data.relation ?? '',
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            gender: data.gender ?? 'male'
          })
        } catch (error) {
          console.error('Failed to fetch patient data', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchAndSetData()
  }, [patient])

  // on submit to save data
  const onSubmit = async (data: z.infer<typeof patientsSchema>) => {
    try {
      if (patient !== 'new') {
        await patchUserPatient(patient, data)
      } else {
        await createUserPatient({
          ...data
        })
      }
      router.back()
      fetchPatients()
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className='w-full rounded-lg bg-white p-6'>
      <div className='fixed top-0 z-50 flex w-full flex-row items-center justify-between bg-white py-2'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 font-semibold'>Patients</p>
        </div>
      </div>
      {!loading && (
        <div className='mt-12'>
          {' '}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(data => {
                onSubmit(data)
              })}
            >
              <div className='flex flex-col gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder='Your Name'
                          className='border-gray-200 bg-gray-100'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phoneNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            className='w-full border-gray-200 bg-gray-100 pl-12'
                            placeholder='Enter phone number'
                            value={field.value}
                            onChange={e => {
                              if (/^\d*$/.test(e.target.value)) {
                                field.onChange(e.target.value)
                              }
                            }}
                          />
                          <div className='absolute left-2 top-2 border-r-2 border-[#B2B2C2] pr-2'>
                            +91
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormReactDatePicker
                  formInstance={form as unknown as UseFormReturn}
                  name='dateOfBirth'
                  placeholder='Select a date'
                  isSmall={true}
                  width={'max-w-[75%]'}
                  label='Date of birth'
                />

                <FormRadioButton
                  formInstance={form as unknown as UseFormReturn}
                  name={'gender'}
                  label={'Gender'}
                  isSmall={true}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' }
                  ]}
                />

                <FormSelectField
                  formInstance={form as unknown as UseFormReturn}
                  isSmall={true}
                  isReq={true}
                  label={'Select Relation'}
                  name={'relation'}
                  placeholder={'Select Relation'}
                  items={(
                    [
                      { label: 'Brother', value: 'Brother' },
                      { label: 'Cousin', value: 'Cousin' },
                      { label: 'Daughter', value: 'Daughter' },
                      { label: 'Father', value: 'Father' },
                      { label: 'Grand Daughter', value: 'Grand Daughter' },
                      { label: 'Grand Father', value: 'Grand Father' },
                      { label: 'Grand Mother', value: 'Grand Mother' },
                      { label: 'Grand Son', value: 'Grand Son' },
                      { label: 'Husband', value: 'Husband' },
                      { label: 'Wife', value: 'Wife' },
                      { label: 'Me', value: 'Me' },
                      { label: 'Mother', value: 'Mother' },
                      { label: 'Sister', value: 'Sister' },
                      { label: 'Son', value: 'Son' }
                    ] as any
                  )?.map((c: any) => ({
                    label: c.label,
                    value: c.value
                  }))}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder='Email'
                          className='border-gray-200 bg-gray-100'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='absolute bottom-4 left-0 flex w-full items-center gap-4 px-4'>
                  <Button
                    onClick={() => router.back()}
                    variant={'secondary'}
                    className='mt-4 w-full'
                  >
                    Cancel
                  </Button>

                  <Button type='submit' className='mt-4 w-full'>
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  )
}

export default PatientForm
