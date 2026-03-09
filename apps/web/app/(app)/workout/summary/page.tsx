'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Share2, ArrowRight, Flame, Clock, Award } from "lucide-react"
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

export default function WorkoutSummaryPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    // Read the result of the API call we stashed during finish
    const raw = sessionStorage.getItem('last_workout_summary')
    if (raw) {
      setSummary(JSON.parse(raw))
      // Fire confetti if there are PRs!
      const parsed = JSON.parse(raw)
      if (parsed.newPRs && parsed.newPRs.length > 0) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#d946ef', '#f43f5e']
          })
        }, 500)
      }
    }
  }, [])

  const handleShare = async () => {
    if (!summary) return
    
    const text = `Just crushed a workout on HeliX! 🧬\n\n` +
      `⏱️ Time: ${Math.round((summary.workout.durationSeconds || 0) / 60)} min\n` +
      `🏆 PRs: ${summary.newPRs?.length || 0}\n\n` +
      `Join me on HeliX.`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HeliX Workout',
          text: text,
        })
      } catch (err) {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Stats copied to clipboard!')
    }
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        <h2 className="text-xl font-bold">No recent workout found.</h2>
        <Button className="mt-4" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </div>
    )
  }

  const { workout, newPRs, progressEvents } = summary
  const totalVolumeScore = progressEvents?.reduce((sum: number, ep: any) => sum + ep.progressScore, 0) || 0

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 max-w-2xl mx-auto">
      <div className="text-center space-y-4 pt-8 pb-4">
        <div className="mx-auto w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
          <Flame className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Workout Complete</h1>
        <p className="text-muted-foreground text-lg">
          {workout.title || 'Strength Session'} logged successfully.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card text-center py-6">
          <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <div className="text-3xl font-bold">{Math.round((workout.durationSeconds || 0) / 60)}</div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Minutes</p>
        </Card>
        
        <Card className="bg-primary text-primary-foreground text-center py-6 border-none shadow-lg shadow-primary/20">
          <Trophy className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <div className="text-3xl font-bold">{newPRs.length}</div>
          <p className="text-sm opacity-80 uppercase tracking-wider font-semibold">New PRs</p>
        </Card>
      </div>

      {newPRs.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" /> Personal Records Broken
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {newPRs.map((pr: any, i: number) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold">{pr.exerciseName}</p>
                  <p className="text-sm text-muted-foreground">Previous: {pr.oldWeight}kg</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-md bg-green-500/15 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-500/20 mb-1">
                    +{Math.round(pr.improvement * 100)}%
                  </span>
                  <p className="font-bold text-lg">{pr.newWeight} kg</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 pt-6">
        <Button size="lg" className="w-full h-14 shadow-lg text-lg" onClick={handleShare}>
          <Share2 className="mr-2 h-5 w-5" /> Share Stats
        </Button>
        <Button variant="outline" size="lg" className="w-full h-14 text-lg" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
