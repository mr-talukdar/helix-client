'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Dumbbell, Trophy, TrendingUp, Calendar, ChevronRight } from "lucide-react"
import Link from 'next/link'
import { format } from 'date-fns'

export function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [profileRes, workoutsRes] = await Promise.all([
          fetch('/api/auth/profile'),
          fetch('/api/workouts?limit=3')
        ])
        
        if (profileRes.ok) setProfile(await profileRes.json())
        if (workoutsRes.ok) setRecentWorkouts(await workoutsRes.json())
      } catch (e) {
        console.error("Failed to load dashboard data", e)
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          {profile && (
            <p className="text-muted-foreground">
              Welcome back, {profile.displayName || 'Athlete'}! Ready to crush today's goals?
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Dumbbell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450 kg</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New PRs</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Bench Press, Squat</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.experienceLevel || 'Intermediate'}</div>
            <p className="text-xs text-muted-foreground">Level 14 Athlete</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 shadow-md">
          <CardHeader>
            <CardTitle>Start New Workout</CardTitle>
            <CardDescription>
              Time to log your next session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/workout">
              <Button size="lg" className="w-full h-16 text-lg shadow-lg shadow-primary/20">
                <Dumbbell className="mr-2 h-6 w-6" /> Start Workout
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest tracked sessions</CardDescription>
            </div>
            <Link href="/progress">
              <Button variant="ghost" size="sm">View All <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentWorkouts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No workouts recorded yet.</p>
                </div>
              ) : (
                recentWorkouts.map((workout: any) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{workout.title || 'Strength Session'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(workout.completedAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{Math.round((workout.durationSeconds || 0) / 60)} min</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
