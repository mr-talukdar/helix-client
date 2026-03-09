'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressHeader } from '@/components/onboarding/progress-header'
import { FooterAction } from '@/components/onboarding/footer-action'
import { NumericStepper } from '@/components/onboarding/numeric-stepper'

export default function WeightStep() {
  const router = useRouter()
  const [weight, setWeight] = useState(70) 
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight })
      })
      router.push('/onboarding/goals')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ProgressHeader step={4} onBack={() => router.push('/onboarding/height')} />
      
      <main className="flex-grow w-full max-w-md px-6 flex flex-col justify-center items-center">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">What's your weight?</h1>
          <p className="text-slate-400 text-lg">Measure in kilograms (kg) to track your progress effectively.</p>
        </div>

        <NumericStepper 
          value={weight}
          onChange={setWeight}
          label="kg"
          min={30}
          max={300}
          step={1}
        />
      </main>

      <FooterAction 
        onNext={handleNext} 
        loading={loading}
      />
    </>
  )
}
