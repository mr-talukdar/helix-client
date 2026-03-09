'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Trophy, Activity, ArrowLeft, Loader2, UserPlus, CheckCircle2, ArrowRight } from "lucide-react"
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GymHubPage() {
  const router = useRouter()
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [feed, setFeed] = useState<any[]>([])
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const gymRes = await fetch(`/api/gym/${params.id}`)
        if (gymRes.ok) setData(await gymRes.json())

        const lbRes = await fetch(`/api/gym/leaderboard?gymId=${params.id}`)
        if (lbRes.ok) setLeaderboard(await lbRes.json())

        const feedRes = await fetch(`/api/gym/feed?gymId=${params.id}`)
        if (feedRes.ok) setFeed(await feedRes.json())
      } catch (e) {
        console.error("Failed to load gym data", e)
      }
    }
    fetchData()
  }, [params.id])

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      const res = await fetch('/api/gym/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId: params.id })
      })

      if (res.ok) {
        toast.success('Joined gym successfully!')
        setData({ ...data, isMember: true })
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to join gym')
      }
    } catch (e) {
      toast.error('Unexpected error occurred')
    } finally {
      setIsJoining(false)
    }
  }

  if (!data) return (
    <div className="flex-1 p-8 flex justify-center items-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  const { gym, isMember } = data

  return (
    <div className="flex-1 pb-24">
      <div 
        className="h-48 w-full relative bg-muted flex items-end p-6 border-b border-border/50"
        style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2)), url(https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <Button variant="outline" size="icon" className="absolute top-4 left-4 bg-background/50 backdrop-blur border-0 hover:bg-background/80" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-white">
          <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-md">{gym.name}</h1>
          <div className="flex items-center text-white/80 mt-1">
            <MapPin className="h-4 w-4 mr-1" /> {gym.location}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6 -mt-4 relative z-10">
        <Card className="shadow-lg">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{isMember ? 'You are a member' : 'Join this gym'}</p>
              <p className="text-sm text-muted-foreground">{isMember ? 'Compete and share activity.' : 'Unlock the leaderboard and feed.'}</p>
            </div>
            {isMember ? (
              <Button variant="secondary" disabled className="h-10 text-green-500 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Member
              </Button>
            ) : (
              <Button onClick={handleJoin} disabled={isJoining} className="h-10 shadow-md">
                {isJoining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />} 
                Join Gym
              </Button>
            )}
          </CardContent>
        </Card>

        {isMember ? (
          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-12">
              <TabsTrigger value="leaderboard" className="h-10"><Trophy className="h-4 w-4 mr-2"/> Leaderboard</TabsTrigger>
              <TabsTrigger value="feed" className="h-10"><Activity className="h-4 w-4 mr-2"/> Activity Feed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Relative Improvement</CardTitle>
                  <CardDescription>Ranked by Progress Score (last 30 days)</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {leaderboard.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No leaderboard data yet.</div>
                  ) : (
                    leaderboard.map((entry, idx) => (
                      <div key={entry.userId} className="flex flex-row items-center p-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <div className="w-8 font-bold text-muted-foreground flex justify-center">
                          {idx === 0 ? <Trophy className="h-5 w-5 text-yellow-500" /> : idx + 1}
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-semibold">{entry.name || 'Athlete'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{entry.score}</p>
                          <p className="text-xs text-muted-foreground">pts</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feed" className="space-y-4">
              {feed.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">The feed is quiet. Go smash a PR!</div>
              ) : (
                feed.map((event) => (
                  <Card key={event.id} className="overflow-hidden bg-card">
                    <CardContent className="p-4 flex gap-4">
                      <div className="p-2 bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                        {event.eventType === 'PR_BROKEN' ? <Trophy className="h-5 w-5 text-primary" /> : <Activity className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm">
                          <span className="font-bold">{event.userName || 'Someone'}</span>{' '}
                          {event.title}
                        </p>
                        {event.metadata?.oldWeight && event.metadata?.newWeight && (
                          <div className="mt-2 inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                            {event.metadata.oldWeight}kg <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" /> <span className="text-green-500 ml-1">{event.metadata.newWeight}kg</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-8 text-center text-muted-foreground border border-border/50 bg-muted/20 rounded-xl mt-8 flex flex-col items-center">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Members Only Data</h3>
            <p className="max-w-xs">You must be a member of {gym.name} to view its realtime leadership board and user activity feed.</p>
          </div>
        )}
      </div>
    </div>
  )
}
