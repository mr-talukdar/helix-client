'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Activity, TrendingUp, Trophy, Dumbbell } from "lucide-react"

export default function ProgressPage() {
  const [summary, setSummary] = useState<any>(null)
  const [benchTrends, setBenchTrends] = useState<any[]>([])
  
  // We need an exercise ID to fetch trends. In a real app we'd let the user select.
  // For this v1 demo, we'll fetch the first exercise named "Barbell Bench Press"
  const [benchId, setBenchId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Get summary
        const summaryRes = await fetch('/api/progress?days=90')
        if (summaryRes.ok) setSummary(await summaryRes.json())

        // 2. Get Bench Press ID
        const exRes = await fetch('/api/exercises')
        if (exRes.ok) {
          const exercises = await exRes.json()
          const bench = exercises.find((e: any) => e.name === 'Barbell Bench Press')
          if (bench) setBenchId(bench.id)
        }
      } catch (e) {
        console.error("Failed to load progress data", e)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchTrends() {
      if (!benchId) return
      try {
        const trendRes = await fetch(`/api/progress/trends?days=90&exerciseId=${benchId}`)
        if (trendRes.ok) setBenchTrends(await trendRes.json())
      } catch (e) {
        console.error("Failed to load trend data", e)
      }
    }
    fetchTrends()
  }, [benchId])

  // Chart styling based on theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-xl">
          <p className="font-semibold text-sm mb-1">{new Date(label).toLocaleDateString()}</p>
          <p className="text-primary font-bold">{`${payload[0].value} kg`}</p>
          <p className="text-muted-foreground text-xs mt-1">Max Weight</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Progress</h2>
        <p className="text-muted-foreground">
          Track your strength analytics over the last 90 days.
        </p>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workouts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalWorkouts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume (kg)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(summary.totalVolume).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PRs</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{summary.prCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="col-span-4 mt-6">
        <CardHeader>
          <CardTitle>Strength Trend: Bench Press</CardTitle>
          <CardDescription>
            Your maximum weight lifted per session over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0 pb-4">
          {benchTrends.length > 0 ? (
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={benchTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    className="mt-2"
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="var(--primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[300px] w-full flex items-center justify-center border border-dashed border-border rounded-lg mt-4 bg-muted/10">
               <p className="text-muted-foreground flex items-center"><TrendingUp className="mr-2 h-4 w-4 opacity-50"/> Not enough data to show trends.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
