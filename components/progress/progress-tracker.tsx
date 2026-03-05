'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import { WorkoutHeader } from '@/components/workout/workout-header'

interface ProgressData {
  exercise: string
  data: Array<{
    date: string
    weight: number
  }>
}

const mockData: ProgressData[] = [
  {
    exercise: 'Bench Press',
    data: [
      { date: 'Week 1', weight: 185 },
      { date: 'Week 2', weight: 185 },
      { date: 'Week 3', weight: 190 },
      { date: 'Week 4', weight: 190 },
      { date: 'Week 5', weight: 195 },
      { date: 'Week 6', weight: 205 },
      { date: 'Week 7', weight: 210 },
      { date: 'Week 8', weight: 215 },
    ],
  },
  {
    exercise: 'Squat',
    data: [
      { date: 'Week 1', weight: 315 },
      { date: 'Week 2', weight: 315 },
      { date: 'Week 3', weight: 325 },
      { date: 'Week 4', weight: 335 },
      { date: 'Week 5', weight: 335 },
      { date: 'Week 6', weight: 345 },
      { date: 'Week 7', weight: 355 },
      { date: 'Week 8', weight: 365 },
    ],
  },
  {
    exercise: 'Deadlift',
    data: [
      { date: 'Week 1', weight: 405 },
      { date: 'Week 2', weight: 405 },
      { date: 'Week 3', weight: 415 },
      { date: 'Week 4', weight: 425 },
      { date: 'Week 5', weight: 435 },
      { date: 'Week 6', weight: 445 },
      { date: 'Week 7', weight: 455 },
      { date: 'Week 8', weight: 475 },
    ],
  },
]

export function ProgressTracker() {
  const [selectedExercise, setSelectedExercise] = useState(0)
  const [progressStats, setProgressStats] = useState<any>(null)

  useEffect(() => {
    const currentData = mockData[selectedExercise]
    const startWeight = currentData.data[0].weight
    const currentWeight = currentData.data[currentData.data.length - 1].weight
    const improvement = currentWeight - startWeight
    const percentChange = ((improvement / startWeight) * 100).toFixed(1)

    setProgressStats({
      startWeight,
      currentWeight,
      improvement,
      percentChange,
    })
  }, [selectedExercise])

  if (!progressStats) return null

  const chartData = mockData[selectedExercise].data

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl">
        <WorkoutHeader
          title="Progress"
          subtitle="Track your strength gains"
        />

        {/* Exercise Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {mockData.map((exercise, index) => (
            <Button
              key={exercise.exercise}
              onClick={() => setSelectedExercise(index)}
              variant={selectedExercise === index ? 'default' : 'outline'}
              className={`whitespace-nowrap ${
                selectedExercise === index
                  ? 'bg-primary text-primary-foreground'
                  : 'border-border text-foreground hover:bg-secondary'
              }`}
            >
              {exercise.exercise}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-card border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Started At</p>
            <p className="text-2xl font-bold text-foreground">{progressStats.startWeight}</p>
            <p className="text-xs text-muted-foreground">lbs</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Current PR</p>
            <p className="text-2xl font-bold text-primary">{progressStats.currentWeight}</p>
            <p className="text-xs text-muted-foreground">lbs</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Improvement</p>
            <p className="text-2xl font-bold text-primary">+{progressStats.improvement}</p>
            <p className="text-xs text-muted-foreground">lbs</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Growth</p>
            <p className="text-2xl font-bold text-primary">+{progressStats.percentChange}%</p>
            <p className="text-xs text-muted-foreground">increase</p>
          </Card>
        </div>

        {/* Chart */}
        <Card className="bg-card border-border p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progress Chart
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(18.73, 100%, 60%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(18.73, 100%, 60%)', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Timeline */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Timeline
          </h3>
          <div className="space-y-3">
            {chartData.map((entry, index) => (
              <div
                key={entry.date}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index % 2 === 0 ? 'bg-secondary' : 'bg-secondary/50'
                }`}
              >
                <span className="text-sm text-foreground font-medium">{entry.date}</span>
                <span className="text-sm font-bold text-primary">{entry.weight} lbs</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
