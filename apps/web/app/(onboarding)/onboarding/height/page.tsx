'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressHeader } from '@/components/onboarding/progress-header'
import { FooterAction } from '@/components/onboarding/footer-action'
import { NumericStepper } from '@/components/onboarding/numeric-stepper'

export default function HeightStep() {
  const router = useRouter()
  const [height, setHeight] = useState(175) 
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height })
      })
      router.push('/onboarding/weight')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ProgressHeader step={3} onBack={() => router.push('/onboarding/age')} />
      
      <main className="flex-grow w-full max-w-md px-6 flex flex-col justify-center items-center">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">What's your height?</h1>
          <p className="text-slate-400 text-lg">Measure in centimeters (cm) for accurate BMI calculations.</p>
        </div>

        <NumericStepper 
          value={height}
          onChange={setHeight}
          label="cm"
          min={100}
          max={250}
        />
      </main>

      <FooterAction 
        onNext={handleNext} 
        loading={loading}
      />
    </>
  )
}
