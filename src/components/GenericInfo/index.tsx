'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { useTranslations } from 'next-intl'

export default function GenericInformation() {
  const router = useRouter()
  const homePageGenericAboutTranslations = useTranslations('HomePageGenericAbout')

  const cardContent = [
    {
      label: 'Reliable',
      imgsrc: '/images/Reliable.svg',
      gradient: ['#FFFACD', '#FFF280'],
      desc: [
        'Proven effectiveness',
        'Consistent formulation',
        'Independent quality testing'
      ],
      i18nKey: 'reliable'
    },
    {
      label: 'Secure',
      imgsrc: '/images/Secure.svg',
      gradient: ['#FFDAB9', '#FFB370'],
      desc: [
        'Regulatory approval',
        'Good Manufacturing practice',
        'Monitoring for safety'
      ],
      i18nKey: 'secure'
    },
    {
      label: 'Affordable',
      imgsrc: '/images/Affordable.svg',
      gradient: ['#ADD8E6', '#6BCCF8'],
      desc: [
        'Lower promotion costs',
        'Established formulation',
        'No commission to agents'
      ],
      i18nKey: 'affordable'
    },
    {
      label: 'Just as effective as branded medicine',
      imgsrc: '/images/Effective.svg',
      gradient: ['#FFC0CB', '#FF8BA0'],
      desc: [
        'Same active ingredient',
        'Same dosage form',
        'Same purity and strength'
      ],
      i18nKey: 'affordable'
    }
  ]

  const accordContent = [
    {
      qstn: '1.  Learn what generic medicines are and how they compare to brand-name drugs.',
      ans: `Generic medicines are versions of brand-name drugs that contain the same active ingredients, work in the same way, and are designed to be just as effective. When the patent on a brand-name drug expires, other manufacturers are allowed to produce a "generic" version, which costs much less. The lower price is mainly because generic manufacturers don't have to invest in expensive research, development, or marketing like the original creators of the brand-name drug. This makes generic medicines a highly affordable yet reliable option for patients.`
    },
    {
      qstn: '2.  Discover the safety and quality checks that generic medicines must pass.',
      ans: `Before a generic medicine is allowed on the market, it must go through strict safety and quality assessments by regulatory authorities, like the FDA. These medicines must demonstrate that they are "bioequivalent" to their brand-name counterparts, meaning they work in the body in the same way and have the same benefits. The production facilities are also regularly inspected to ensure high standards are maintained. Through this careful screening process, patients can trust that generic medicines are both safe and effective.`
    },
    {
      qstn: '3.  Find out why generic medicines are essential for affordable healthcare.',
      ans: `Generic medicines make healthcare more affordable for millions of people. By offering the same treatment benefits as brand-name drugs at lesser cost, generics help reduce the financial burden of medical expenses. This is especially important for patients with chronic conditions who require ongoing medication.`
    },
    {
      qstn: '4.  Find out why generic medicines are essential for affordable healthcare.',
      ans: `Health authorities closely monitor the safety of generic drugs, which are trusted worldwide by doctors and patients. Because generics have the same active ingredients as brand-name drugs, they offer the same level of safety. Even after approval, generic medicines go through regular testing to stay on the market. This ongoing monitoring assures patients that generics are a safe choice.`
    },
    {
      qstn: '5.  Benefits of choosing generic medicines. ',
      ans: `Choosing generic medicines brings a range of benefits, including significant cost savings without sacrificing quality. Generic drugs make it possible for people to manage their health affordably, especially for long-term treatments. Additionally, since they must meet strict regulatory standards, you can trust that generics are as effective as brand-name drugs. Opting for generics is a smart choice for your health and your wallet.`
    }
  ]

  return (
    <div className='relative'>
      <div className='sticky top-0 z-50 mb-2 flex w-full flex-row items-center justify-between border-b bg-white px-4 py-4'>
        <div className='flex flex-row items-center justify-center'>
          <div
            className='rounded-full bg-[#F4F4F4] p-2'
            onClick={() => router.back()}
          >
            <ArrowLeft color='#3C3C3C' size={20} />
          </div>
          <p className='ml-2 text-sm font-semibold'>Generic Medicine</p>
        </div>

         <div
          className='rounded-full bg-[#F4F4F4] p-2'
          onClick={() => router.push('/search')}
        >
          <Search color='#3C3C3C' size={20} />
        </div>
      </div>

      <div className='rounded-md bg-white p-4 dark:bg-gray-900 md:p-6'>
        
        <div className='flex w-full flex-col items-center justify-center'>
          <div style={{ position: 'relative', width: '180px', height: '60px' }}>
            <Image
              src={'/images/Logo.svg'}
              alt='davaindia logo'
              fill
              priority={false}
            />
          </div>
          <p className='my-4 text-base font-medium text-center'>
            Davaindia generic medicines are the smarter choice
          </p>

          <div className='mb-2 flex w-full flex-col'>
            {cardContent.map((item, idx) => (
              <div
                className='mx-1 my-3 flex-1 rounded-xl px-6 py-8'
                key={idx}
                style={{
                  background: `linear-gradient(to bottom, ${item.gradient[0]}, ${item.gradient[1]})`
                }}
              >
                <span className='mb-5 flex items-center gap-2 text-lg font-semibold'>
                  <div
                    className='w-[56px] h-[56px]'
                    key={idx}
                    style={{
                      position: 'relative',
                    }}
                  >
                    <Image
                    width={56}
                    height={56}
                      src={item.imgsrc}
                      alt='generic image'
                      
                      priority={false}
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                <span style={{ width: "calc(100% - 60px)" }}>{ homePageGenericAboutTranslations(item.i18nKey) }</span>
                </span>
                {item.desc.map((line, index) => (
                  <span
                    className='block py-2 text-sm font-semibold'
                    key={index}
                  >
                    {line}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <Accordion type='single' collapsible className='w-full text-left'>
            {accordContent.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className='border-text-label text-left mx-2 my-6 rounded-xl border-2 px-6 py-1 shadow'
              >
                <AccordionTrigger className=''>
                  <span className='text-[15px] font-semibold'>{item.qstn}</span>
                  {/* <ChevronDown className='transform transition-transform duration-300 group-aria-expanded:rotate-180' /> */}
                </AccordionTrigger>
                <AccordionContent className='border-t-2 py-4 font-medium'>
                  {item.ans}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
