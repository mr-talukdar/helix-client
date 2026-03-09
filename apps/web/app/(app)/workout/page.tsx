'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutStore } from '@/lib/store/workout'
import { formatDuration, intervalToDuration } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from "@/components/ui/card"
import { Play, CheckCircle2, Circle, Plus, Minus, Trash2, StopCircle, Trophy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function WorkoutTrackerPage() {
  const router = useRouter()
  const { isActive, startTime, title, sets, startWorkout, addSet, updateSet, toggleSetComplete, removeSet, finishWorkout } = useWorkoutStore()
  
  const [elapsedString, setElapsedString] = useState('00:00:00')
  const [exercises, setExercises] = useState<any[]>([])
  const [selectedExercise, setSelectedExercise] = useState('')
  const [isFinishing, setIsFinishing] = useState(false)

  // Timer effect
  useEffect(() => {
    if (!isActive || !startTime) return
    
    const interval = setInterval(() => {
      const duration = intervalToDuration({ start: startTime, end: Date.now() })
      const formatted = [
        duration.hours?.toString().padStart(2, '0') || '00',
        duration.minutes?.toString().padStart(2, '0') || '00',
        duration.seconds?.toString().padStart(2, '0') || '00'
      ].join(':')
      setElapsedString(formatted)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, startTime])

  // Fetch exercises
  useEffect(() => {
    async function fetchExercises() {
      try {
        const res = await fetch('/api/exercises')
        if (res.ok) setExercises(await res.json())
      } catch (e) {
        console.error('Failed to load exercises', e)
      }
    }
    fetchExercises()
  }, [])

  const handleStart = () => startWorkout('Afternoon Lift')
  
  const handleAddSet = () => {
    if (!selectedExercise) return toast.error('Please select an exercise first')
    const exercise = exercises.find(e => e.id === selectedExercise)
    if (exercise) {
      // Find the last used weight/reps for this exercise in the current workout to optimize entry
      const pastSets = sets.filter(s => s.exerciseId === selectedExercise)
      const lastSet = pastSets[pastSets.length - 1]
      
      addSet(
        exercise.id, 
        exercise.name, 
        lastSet ? lastSet.weight : 20, // default bar weight
        lastSet ? lastSet.reps : 10
      )
    }
  }

  const handleFinish = async () => {
    if (sets.length === 0) {
      finishWorkout()
      return router.push('/dashboard')
    }

    setIsFinishing(true)
    try {
      const durationSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
      const payload = {
        title,
        durationSeconds,
        startedAt: startTime ? new Date(startTime).toISOString() : undefined,
        sets: sets.filter(s => s.completed).map(s => ({
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe
        }))
      }

      const res = await fetch('/api/workouts/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save workout')
      
      const result = await res.json()
      finishWorkout() // clear local state
      
      // Store result in session storage temporarily for the summary screen
      sessionStorage.setItem('last_workout_summary', JSON.stringify(result))
      router.push('/workout/summary')
      
    } catch (error) {
      toast.error('Error saving workout. Your data is still saved locally.')
    } finally {
      setIsFinishing(false)
    }
  }

  // Pre-start screen
  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center space-y-6">
        <div className="p-4 bg-primary/10 rounded-full animate-pulse">
          <Play className="h-12 w-12 text-primary translate-x-1" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Ready to lift?</h2>
          <p className="text-muted-foreground">Start an empty workout to log as you go.</p>
        </div>
        <Button size="lg" className="w-full max-w-sm h-14 text-lg shadow-lg shadow-primary/20" onClick={handleStart}>
          Start Empty Workout
        </Button>
      </div>
    )
  }

  // Auto-activate the first incomplete set
  const activeSet = sets.find(s => !s.completed)

  // Group sets by exercise for UI
  const groupedSets = sets.reduce((acc, set) => {
    if (!acc[set.exerciseId]) acc[set.exerciseId] = { name: set.exerciseName, items: [] }
    acc[set.exerciseId].items.push(set)
    return acc
  }, {} as Record<string, { name: string, items: typeof sets }>)

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="font-bold text-xl leading-tight tracking-tight">{title}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <p className="text-sm text-slate-500 font-medium">{elapsedString}</p>
          </div>
        </div>
        <Button 
          variant="default" 
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 font-semibold" 
          onClick={handleFinish} 
          disabled={isFinishing}
        >
          {isFinishing ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <StopCircle className="h-4 w-4 mr-1.5" />}
          Finish
        </Button>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 space-y-8">
        {/* Top Control Panel (Active Logger) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-5">
            {activeSet ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* Weight Stepper */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Weight (kg)</label>
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5">
                      <button 
                        onClick={() => updateSet(activeSet.id, { weight: Math.max(0, activeSet.weight - 2.5) })}
                        className="w-12 h-12 flex items-center justify-center rounded-[10px] bg-white dark:bg-slate-700 shadow-sm text-primary active:scale-95 transition-transform"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <span className="text-2xl font-black tabular-nums">{activeSet.weight}</span>
                      <button 
                        onClick={() => updateSet(activeSet.id, { weight: activeSet.weight + 2.5 })}
                        className="w-12 h-12 flex items-center justify-center rounded-[10px] bg-white dark:bg-slate-700 shadow-sm text-primary active:scale-95 transition-transform"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Reps Stepper */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Reps</label>
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5">
                      <button 
                        onClick={() => updateSet(activeSet.id, { reps: Math.max(0, activeSet.reps - 1) })}
                        className="w-12 h-12 flex items-center justify-center rounded-[10px] bg-white dark:bg-slate-700 shadow-sm text-primary active:scale-95 transition-transform"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <span className="text-2xl font-black tabular-nums">{activeSet.reps}</span>
                      <button 
                        onClick={() => updateSet(activeSet.id, { reps: activeSet.reps + 1 })}
                        className="w-12 h-12 flex items-center justify-center rounded-[10px] bg-white dark:bg-slate-700 shadow-sm text-primary active:scale-95 transition-transform"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="h-14 px-4 rounded-xl border-slate-300 dark:border-slate-700"
                    onClick={() => removeSet(activeSet.id)}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </Button>
                  <button 
                    onClick={() => toggleSetComplete(activeSet.id)}
                    className="h-14 flex-1 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="text-lg">Log Set {sets.filter(s => s.exerciseId === activeSet.exerciseId).findIndex(s => s.id === activeSet.id) + 1}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-end gap-3 pt-2">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Add Next Exercise</label>
                  <select 
                    className="w-full h-14 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 font-semibold text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-0 appearance-none outline-none"
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                  >
                    <option value="" disabled>Select Exercise...</option>
                    {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <button 
                  onClick={handleAddSet}
                  disabled={!selectedExercise}
                  className="h-14 px-6 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {Object.entries(groupedSets).map(([exId, group]) => (
          <div key={exId} className="space-y-3">
            <h2 className="text-lg font-bold px-1 tracking-tight text-slate-800 dark:text-slate-200">
              {group.name}
            </h2>
            <div className="flex flex-col gap-2">
              {group.items.map((set, idx) => {
                const isActiveSet = activeSet?.id === set.id
                
                if (set.completed) {
                  return (
                    <div key={set.id} className="flex items-center h-[72px] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 justify-between transition-all">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{set.weight} <span className="text-xs font-normal text-slate-500">kg</span></div>
                          <div className="text-sm text-slate-500">{set.reps} Reps</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleSetComplete(set.id)} className="p-2 text-primary hover:text-primary/80 transition-colors">
                          <CheckCircle2 className="w-8 h-8 fill-primary/20" />
                        </button>
                      </div>
                    </div>
                  )
                }

                if (isActiveSet) {
                  return (
                    <div key={set.id} className="flex items-center h-[72px] bg-white dark:bg-slate-900 border-2 border-primary/50 rounded-xl px-4 justify-between shadow-lg shadow-primary/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{set.weight} <span className="text-xs font-normal text-slate-500">kg</span></div>
                          <div className="text-sm text-slate-500">Target: {set.reps} Reps</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Circle className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                      </div>
                    </div>
                  )
                }

                // Upcoming incomplete set
                return (
                  <div key={set.id} className="flex items-center h-[72px] bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl px-4 justify-between opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-500">{set.weight} <span className="text-xs font-normal">kg</span></div>
                        <div className="text-sm text-slate-500">Target: {set.reps}</div>
                      </div>
                    </div>
                    <button onClick={() => removeSet(set.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        
        {/* Empty State / Add First Exercise */}
        {sets.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">No sets recorded</h3>
            <p className="text-slate-500 text-sm">Select an exercise from the panel below to begin logging your workout.</p>
          </div>
        )}
      </main>


    </div>
  )
}
