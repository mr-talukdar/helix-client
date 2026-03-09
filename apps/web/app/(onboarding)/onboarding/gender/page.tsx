'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressHeader } from '@/components/onboarding/progress-header'
import { FooterAction } from '@/components/onboarding/footer-action'
import { User, Users } from 'lucide-react'

export default function GenderStep() {
  const router = useRouter()
  const [gender, setGender] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    if (!gender) return
    
    setLoading(true)
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender })
      })
      router.push('/onboarding/age')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ProgressHeader step={1} />
      
      <main className="flex-grow w-full max-w-md px-6 flex flex-col justify-center items-center">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">What's your gender?</h1>
          <p className="text-slate-400 text-lg">This helps us calculate your optimal workout metrics.</p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <button 
            onClick={() => setGender('male')}
            className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
              gender === 'male' 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <User className="w-6 h-6" />
              <span className="text-xl font-semibold">Male</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${gender === 'male' ? 'border-primary' : 'border-slate-600'}`}>
              {gender === 'male' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
            </div>
          </button>

          <button 
            onClick={() => setGender('female')}
            className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
              gender === 'female' 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <User className="w-6 h-6" />
              <span className="text-xl font-semibold">Female</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${gender === 'female' ? 'border-primary' : 'border-slate-600'}`}>
              {gender === 'female' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
            </div>
          </button>
          
          <button 
            onClick={() => setGender('other')}
            className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
              gender === 'other' 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <Users className="w-6 h-6" />
              <span className="text-xl font-semibold">Other</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${gender === 'other' ? 'border-primary' : 'border-slate-600'}`}>
              {gender === 'other' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
            </div>
          </button>
        </div>
      </main>

      <FooterAction 
        onNext={handleNext} 
        disabled={!gender} 
        loading={loading}
        showDisclaimer
      />
    </>
  )
}
