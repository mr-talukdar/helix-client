'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Loader2, ArrowRight } from "lucide-react"

export default function GymSearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [gyms, setGyms] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Initial load, no query
    handleSearch()
  }, [])

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      const res = await fetch(`/api/gym/search?q=${query}`)
      if (res.ok) {
        setGyms(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Find a Gym</h2>
        <p className="text-muted-foreground">
          Join your local iron temple to unlock leaderboards and activity feeds.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 h-10" 
            placeholder="Search by name or city..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching} className="h-10">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      <div className="space-y-4 mt-6">
        {gyms.length === 0 && !isSearching ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            No gyms found. Try a different search term.
          </div>
        ) : (
          gyms.map(gym => (
            <Card key={gym.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => router.push(`/gym/${gym.id}`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{gym.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" /> {gym.location}
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
