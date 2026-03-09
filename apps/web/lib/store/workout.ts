'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface WorkoutSet {
  id: string
  exerciseId: string
  exerciseName: string
  setNumber: number
  weight: number
  reps: number
  rpe?: number
  completed: boolean
}

export interface WorkoutState {
  isActive: boolean
  startTime: number | null
  title: string
  notes: string
  sets: WorkoutSet[]
  
  // Actions
  startWorkout: (title?: string) => void
  addSet: (exerciseId: string, exerciseName: string, weight: number, reps: number) => void
  updateSet: (setId: string, updates: Partial<WorkoutSet>) => void
  toggleSetComplete: (setId: string) => void
  removeSet: (setId: string) => void
  setNotes: (notes: string) => void
  finishWorkout: () => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      isActive: false,
      startTime: null,
      title: 'Workout',
      notes: '',
      sets: [],

      startWorkout: (title = 'Strength Session') => set({
        isActive: true,
        startTime: Date.now(),
        title,
        notes: '',
        sets: [],
      }),

      addSet: (exerciseId, exerciseName, weight, reps) => set((state) => {
        // Find highest set number for this exercise
        const exerciseSets = state.sets.filter(s => s.exerciseId === exerciseId)
        const nextSetNum = exerciseSets.length > 0 
          ? Math.max(...exerciseSets.map(s => s.setNumber)) + 1 
          : 1

        const newSet: WorkoutSet = {
          id: crypto.randomUUID(),
          exerciseId,
          exerciseName,
          setNumber: nextSetNum,
          weight,
          reps,
          completed: false,
        }

        return { sets: [...state.sets, newSet] }
      }),

      updateSet: (setId, updates) => set((state) => ({
        sets: state.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
      })),

      toggleSetComplete: (setId) => set((state) => ({
        sets: state.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
      })),

      removeSet: (setId) => set((state) => ({
        sets: state.sets.filter(s => s.id !== setId)
      })),

      setNotes: (notes) => set({ notes }),

      finishWorkout: () => set({
        isActive: false,
        startTime: null,
        title: 'Workout',
        notes: '',
        sets: [],
      }),
    }),
    {
      name: 'helix-active-workout',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
