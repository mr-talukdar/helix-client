'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProgressHeaderProps {
  step: number
  totalSteps?: number
  onBack?: () => void
}

export function ProgressHeader({ step, totalSteps = 6, onBack }: ProgressHeaderProps) {
  const router = useRouter()
  const progressPercentage = Math.round((step / totalSteps) * 100)

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header className="w-full max-w-md px-6 pt-12 pb-8">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={handleBack}
          className="text-slate-500 hover:text-primary transition-colors flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-medium text-slate-400">
          Step {step} of {totalSteps}
        </span>
        <div className="w-6"></div> {/* Spacer for symmetry */}
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </header>
  )
}
