'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressHeader } from '@/components/onboarding/progress-header'
import { FooterAction } from '@/components/onboarding/footer-action'
import { Check } from 'lucide-react'

const GOAL_OPTIONS = [
  { id: 'build-muscle', label: 'Build Muscle', desc: 'Increase lean muscle mass' },
  { id: 'lose-weight', label: 'Lose Weight', desc: 'Drop body fat and get lean' },
  { id: 'increase-strength', label: 'Increase Strength', desc: 'Lift heavier weights' },
  { id: 'improve-endurance', label: 'Improve Endurance', desc: 'Boost cardiovascular health' },
  { id: 'general-fitness', label: 'General Fitness', desc: 'Stay active and healthy' },
]

export default function GoalsStep() {
  const router = useRouter()
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) 
        ? prev.filter(g => g !== id)
        : [...prev, id]
    )
  }

  const handleNext = async () => {
    if (selectedGoals.length === 0) return

    setLoading(true)
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: selectedGoals })
      })
      router.push('/onboarding/experience')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ProgressHeader step={5} onBack={() => router.push('/onboarding/weight')} />
      
      <main className="flex-grow w-full max-w-md px-6 flex flex-col justify-start items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">What are your goals?</h1>
          <p className="text-slate-400 text-lg">Select all that apply.</p>
        </div>

        <div className="w-full flex flex-col gap-3 pb-8">
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id)
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all text-left ${
                  isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-slate-800 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className={`font-semibold text-lg ${isSelected ? 'text-primary' : 'text-slate-200'}`}>
                    {goal.label}
                  </div>
                  <div className={`text-sm ${isSelected ? 'text-primary/70' : 'text-slate-500'}`}>
                    {goal.desc}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isSelected ? 'border-primary bg-primary text-white' : 'border-slate-600'
                }`}>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              </button>
            )
          })}
        </div>
      </main>

      <FooterAction 
        onNext={handleNext} 
        disabled={selectedGoals.length === 0}
        loading={loading}
      />
    </>
  )
}
