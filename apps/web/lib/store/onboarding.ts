'use client'

import { create } from 'zustand'

export interface OnboardingState {
  gender: string
  age: number | null
  height: number | null
  weight: number | null
  experienceLevel: string
  goals: string[]
  
  // Actions
  setGender: (val: string) => void
  setAge: (val: number) => void
  setHeight: (val: number) => void
  setWeight: (val: number) => void
  setExperienceLevel: (val: string) => void
  toggleGoal: (val: string) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  gender: '',
  age: null,
  height: null,
  weight: null,
  experienceLevel: '',
  goals: [],

  setGender: (val) => set({ gender: val }),
  setAge: (val) => set({ age: val }),
  setHeight: (val) => set({ height: val }),
  setWeight: (val) => set({ weight: val }),
  setExperienceLevel: (val) => set({ experienceLevel: val }),
  toggleGoal: (val) => set((state) => ({
    goals: state.goals.includes(val) 
      ? state.goals.filter(g => g !== val)
      : [...state.goals, val]
  })),
  reset: () => set({
    gender: '', age: null, height: null, weight: null, experienceLevel: '', goals: []
  }),
}))
