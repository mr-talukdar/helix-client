'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressHeader } from '@/components/onboarding/progress-header'
import { FooterAction } from '@/components/onboarding/footer-action'
import { NumericStepper } from '@/components/onboarding/numeric-stepper'
import { Info } from 'lucide-react'

export default function AgeStep() {
  const router = useRouter()
  const [age, setAge] = useState(24) // Default starting number from Stitch designs
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age })
      })
      router.push('/onboarding/height')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ProgressHeader step={2} onBack={() => router.push('/onboarding/gender')} />
      
      <main className="flex-grow w-full max-w-md px-6 flex flex-col justify-center items-center">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">How old are you?</h1>
          <p className="text-slate-400 text-lg">Your age helps us personalize your HeliX experience.</p>
        </div>

        <NumericStepper 
          value={age}
          onChange={setAge}
          label="Years Old"
          min={14}
          max={100}
        />

        {age < 18 && (
          <div className="mt-8 px-6 py-3 bg-slate-800/50 rounded-full border border-slate-700/50 flex items-center space-x-2 animate-in fade-in zoom-in duration-300">
            <Info className="text-primary w-4 h-4" />
            <span className="text-xs text-slate-300">Features may be limited for minors.</span>
          </div>
        )}
      </main>

      <FooterAction 
        onNext={handleNext} 
        loading={loading}
      />
    </>
  )
}
