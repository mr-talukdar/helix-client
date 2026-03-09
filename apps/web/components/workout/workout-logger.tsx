'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { WorkoutHeader } from './workout-header'
import { ExerciseCard } from './exercise-card'

interface ExerciseSet {
  reps: number
  weight: number
  completed: boolean
}

interface Exercise {
  id: string
  name: string
  sets: ExerciseSet[]
}

interface WorkoutSession {
  date: string
  exercises: Exercise[]
}

const commonExercises = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Barbell Row',
  'Overhead Press',
  'Pull-ups',
  'Dumbbell Curl',
  'Tricep Dips',
  'Leg Press',
  'Lat Pulldown',
]

export function WorkoutLogger() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [newExerciseName, setNewExerciseName] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const today = new Date().toLocaleDateString()
    setCurrentDate(today)
    
    const saved = localStorage.getItem('helix-workout')
    if (saved) {
      const session = JSON.parse(saved)
      if (session.date === today) {
        setExercises(session.exercises)
      }
    }
  }, [])

  const saveWorkout = (updatedExercises: Exercise[]) => {
    setExercises(updatedExercises)
    const session: WorkoutSession = {
      date: currentDate,
      exercises: updatedExercises,
    }
    localStorage.setItem('helix-workout', JSON.stringify(session))
  }

  const addExercise = (name: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name,
      sets: [
        { reps: 10, weight: 0, completed: false },
        { reps: 10, weight: 0, completed: false },
        { reps: 10, weight: 0, completed: false },
      ],
    }
    const updated = [...exercises, newExercise]
    saveWorkout(updated)
    setShowPicker(false)
    setNewExerciseName('')
  }

  const removeExercise = (id: string) => {
    const updated = exercises.filter((e) => e.id !== id)
    saveWorkout(updated)
  }

  const updateSet = (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weight' | 'completed',
    value: any
  ) => {
    const updated = exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets]
        newSets[setIndex] = { ...newSets[setIndex], [field]: value }
        return { ...ex, sets: newSets }
      }
      return ex
    })
    saveWorkout(updated)
  }

  const addSet = (exerciseId: string) => {
    const updated = exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1]
        return {
          ...ex,
          sets: [
            ...ex.sets,
            { reps: lastSet?.reps || 10, weight: lastSet?.weight || 0, completed: false },
          ],
        }
      }
      return ex
    })
    saveWorkout(updated)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl">
        <WorkoutHeader
          title="Today's Workout"
          subtitle={currentDate}
        />

        {/* Exercises List */}
        <div className="space-y-4 mb-6">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              id={exercise.id}
              name={exercise.name}
              sets={exercise.sets}
              onSetUpdate={(setIndex, field, value) =>
                updateSet(exercise.id, setIndex, field, value)
              }
              onAddSet={() => addSet(exercise.id)}
              onRemove={() => removeExercise(exercise.id)}
            />
          ))}
        </div>

        {/* Add Exercise Button */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setShowPicker(!showPicker)}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Exercise
          </Button>
        </div>

        {/* Exercise Picker */}
        {showPicker && (
          <Card className="bg-card border-border p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3">Select Exercise</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {commonExercises.map((name) => (
                <button
                  key={name}
                  onClick={() => addExercise(name)}
                  className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
            <Input
              type="text"
              placeholder="Or type custom exercise"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newExerciseName) {
                  addExercise(newExerciseName)
                }
              }}
              className="mt-3 bg-muted border-border"
            />
          </Card>
        )}

        {exercises.length === 0 && !showPicker && (
          <Card className="bg-card border-border p-8 text-center">
            <p className="text-muted-foreground">Start your workout by adding an exercise</p>
          </Card>
        )}
      </div>
    </div>
  )
}
