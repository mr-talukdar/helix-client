'use client'

import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SetRowProps {
  setIndex: number
  reps: number
  weight: number
  completed: boolean
  onRepsChange: (reps: number) => void
  onWeightChange: (weight: number) => void
  onCompletedChange: (completed: boolean) => void
}

export function SetRow({
  setIndex,
  reps,
  weight,
  completed,
  onRepsChange,
  onWeightChange,
  onCompletedChange,
}: SetRowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-2 items-center p-2 rounded-lg transition-colors',
        completed ? 'bg-secondary' : 'bg-secondary'
      )}
    >
      <button
        onClick={() => onCompletedChange(!completed)}
        className={cn(
          'flex items-center justify-center h-8 rounded font-medium transition-colors',
          completed
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {completed ? (
          <Check className="h-4 w-4" />
        ) : (
          <span>{setIndex + 1}</span>
        )}
      </button>
      <Input
        type="number"
        min="1"
        value={reps}
        onChange={(e) => onRepsChange(parseInt(e.target.value) || 0)}
        className="h-8 text-sm text-center bg-muted border-border"
      />
      <Input
        type="number"
        min="0"
        step="5"
        value={weight}
        onChange={(e) => onWeightChange(parseInt(e.target.value) || 0)}
        className="h-8 text-sm text-center bg-muted border-border"
        placeholder="lbs"
      />
    </div>
  )
}
