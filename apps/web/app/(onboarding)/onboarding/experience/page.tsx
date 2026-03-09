'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressHeader } from '@/components/onboarding/progress-header'
import { FooterAction } from '@/components/onboarding/footer-action'
import { Dumbbell, TrendingUp, Trophy } from 'lucide-react'

// experienceLevel string literals from UserProfile type: 'beginner' | 'intermediate' | 'advanced'
const EXP_OPTIONS = [
  { 
    id: 'beginner', 
    label: 'Beginner', 
    desc: 'Just starting out (0-1 years)', 
    icon: <Dumbbell className="w-6 h-6" /> 
  },
  { 
    id: 'intermediate', 
    label: 'Intermediate', 
    desc: 'Consistent training (1-3 years)', 
    icon: <TrendingUp className="w-6 h-6" /> 
  },
  { 
    id: 'advanced', 
    label: 'Advanced', 
    desc: 'Highly experienced (3+ years)', 
    icon: <Trophy className="w-6 h-6" /> 
  },
]

export default function ExperienceStep() {
  const router = useRouter()
  const [experience, setExperience] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    if (!experience) return

    setLoading(true)
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experienceLevel: experience })
      })
      // Onboarding complete! Send user to the main app layout.
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ProgressHeader step={6} onBack={() => router.push('/onboarding/goals')} />
      
      <main className="flex-grow w-full max-w-md px-6 flex flex-col justify-start items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Experience Level</h1>
          <p className="text-slate-400 text-lg">How long have you been lifting?</p>
        </div>

        <div className="w-full flex flex-col gap-4 pb-8">
          {EXP_OPTIONS.map((exp) => {
            const isSelected = experience === exp.id
            return (
              <button
                key={exp.id}
                onClick={() => setExperience(exp.id)}
                className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
                  isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-slate-800 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/50 text-slate-200'
                }`}
              >
                <div className={`p-3 rounded-full ${isSelected ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400'}`}>
                  {exp.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">
                    {exp.label}
                  </div>
                  <div className={`text-sm mt-0.5 ${isSelected ? 'text-primary/70' : 'text-slate-500'}`}>
                    {exp.desc}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex flex-shrink-0 items-center justify-center ${isSelected ? 'border-primary' : 'border-slate-600'}`}>
                  {isSelected && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                </div>
              </button>
            )
          })}
        </div>
      </main>

      <FooterAction 
        label="Complete Profile"
        onNext={handleNext} 
        disabled={!experience}
        loading={loading}
      />
    </>
  )
}
