'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flame, Trophy, TrendingUp, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WorkoutHeader } from '@/components/workout/workout-header'

interface UserStats {
  streak: number
  totalWorkouts: number
  lastWorkoutDate: string
  personalRecords: Record<string, number>
}

export function Dashboard() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [readiness, setReadiness] = useState<'poor' | 'moderate' | 'good' | 'excellent'>('good')

  useEffect(() => {
    const saved = localStorage.getItem('helix-stats')
    if (saved) {
      setStats(JSON.parse(saved))
    } else {
      const initial: UserStats = {
        streak: 12,
        totalWorkouts: 48,
        lastWorkoutDate: new Date().toLocaleDateString(),
        personalRecords: {
          'Bench Press': 185,
          'Squat': 315,
          'Deadlift': 405,
        },
      }
      setStats(initial)
      localStorage.setItem('helix-stats', JSON.stringify(initial))
    }
  }, [])

  if (!stats) return null

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl">
        <WorkoutHeader
          title="HeliX"
          subtitle="Your strength journey"
        />

        {/* Readiness Score */}
        <Card className="mb-6 bg-card border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Readiness</h2>
            <div
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                readiness === 'excellent' && 'bg-primary text-primary-foreground',
                readiness === 'good' && 'bg-primary text-primary-foreground',
                readiness === 'moderate' && 'bg-secondary text-secondary-foreground',
                readiness === 'poor' && 'bg-destructive text-destructive-foreground'
              )}
            >
              {readiness.charAt(0).toUpperCase() + readiness.slice(1)}
            </div>
          </div>
          <div className="bg-secondary rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">You are ready to crush it today</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: '85%' }}
              />
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Streak */}
          <Card className="bg-card border-border p-4 flex flex-col items-center justify-center text-center">
            <Flame className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>

          {/* Total Workouts */}
          <Card className="bg-card border-border p-4 flex flex-col items-center justify-center text-center">
            <Trophy className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">Total Workouts</p>
          </Card>

          {/* PRs Count */}
          <Card className="bg-card border-border p-4 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {Object.keys(stats.personalRecords).length}
            </p>
            <p className="text-xs text-muted-foreground">PRs Tracked</p>
          </Card>

          {/* Last Workout */}
          <Card className="bg-card border-border p-4 flex flex-col items-center justify-center text-center">
            <Calendar className="h-8 w-8 text-primary mb-2" />
            <p className="text-xs font-medium text-foreground">Today</p>
            <p className="text-xs text-muted-foreground">Last Session</p>
          </Card>
        </div>

        {/* Top PRs */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your PRs</h3>
          <div className="space-y-3">
            {Object.entries(stats.personalRecords).map(([exercise, weight]) => (
              <div key={exercise} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <p className="text-foreground font-medium">{exercise}</p>
                <p className="text-primary font-bold">{weight} lbs</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
