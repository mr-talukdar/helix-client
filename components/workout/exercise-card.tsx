'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { SetRow } from './set-row'

interface ExerciseSet {
  reps: number
  weight: number
  completed: boolean
}

interface ExerciseCardProps {
  id: string
  name: string
  sets: ExerciseSet[]
  onSetUpdate: (setIndex: number, field: 'reps' | 'weight' | 'completed', value: any) => void
  onAddSet: () => void
  onRemove: () => void
}

export function ExerciseCard({
  id,
  name,
  sets,
  onSetUpdate,
  onAddSet,
  onRemove,
}: ExerciseCardProps) {
  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Sets Table */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground font-medium pb-2 border-b border-border">
          <div>Set</div>
          <div>Reps</div>
          <div>Weight</div>
        </div>
        {sets.map((set, index) => (
          <SetRow
            key={index}
            setIndex={index}
            reps={set.reps}
            weight={set.weight}
            completed={set.completed}
            onRepsChange={(reps) => onSetUpdate(index, 'reps', reps)}
            onWeightChange={(weight) => onSetUpdate(index, 'weight', weight)}
            onCompletedChange={(completed) => onSetUpdate(index, 'completed', completed)}
          />
        ))}
      </div>

      {/* Add Set Button */}
      <Button
        onClick={onAddSet}
        variant="outline"
        size="sm"
        className="w-full text-primary border-primary hover:bg-primary hover:text-primary-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Set
      </Button>
    </Card>
  )
}
