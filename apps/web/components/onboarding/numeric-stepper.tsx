'use client'

import { Minus, Plus } from 'lucide-react'

interface NumericStepperProps {
  value: number
  onChange: (newValue: number) => void
  label: string
  min?: number
  max?: number
  step?: number
}

export function NumericStepper({
  value,
  onChange,
  label,
  min = 0,
  max = 999,
  step = 1
}: NumericStepperProps) {

  const handleDecrease = () => {
    if (value - step >= min) {
      onChange(value - step)
    }
  }

  const handleIncrease = () => {
    if (value + step <= max) {
      onChange(value + step)
    }
  }

  return (
    <div className="relative flex flex-col items-center transition-all bg-background dark:bg-background-dark py-12">
      {/* Background Decoration Glow */}
      <div className="absolute -z-10 w-64 h-64 bg-primary/10 blur-[100px] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="flex items-center space-x-8">
        {/* Decrease Button */}
        <button 
          onClick={handleDecrease}
          disabled={value <= min}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 hover:border-primary text-slate-100 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:hover:border-slate-700 cursor-pointer disabled:cursor-not-allowed"
        >
          <Minus className="w-8 h-8" />
        </button>
        
        {/* Value Display */}
        <div className="flex flex-col items-center w-32">
          <div className="text-8xl font-black text-primary tracking-tighter tabular-nums drop-shadow-md">
            {value}
          </div>
          <div className="text-sm uppercase tracking-widest text-slate-500 font-bold mt-2 text-center">
            {label}
          </div>
        </div>
        
        {/* Increase Button */}
        <button 
          onClick={handleIncrease}
          disabled={value >= max}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 hover:border-primary text-slate-100 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:hover:border-slate-700 cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>
    </div>
  )
}
