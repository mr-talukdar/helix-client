'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@helix/database'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Target, 
  History, 
  Bell, 
  ShieldCheck, 
  CreditCard, 
  LogOut,
  ChevronRight,
  Scale
} from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/profile')
        if (res.ok) setProfile(await res.json())
      } catch (e) {
        console.error("Failed to load profile", e)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/')
  }

  if (!profile) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6 pb-24 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-20 bg-muted rounded-xl"></div>
          <div className="h-40 bg-muted rounded-xl"></div>
          <div className="h-60 bg-muted rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-2">
        <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center text-2xl font-bold">
          {profile.displayName?.charAt(0) || <User />}
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{profile.displayName || 'Athlete'}</h2>
          <p className="text-muted-foreground">{profile.id.substring(0, 8)}... • Level {Math.floor(Math.random() * 20) + 5}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mt-2">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 mr-2">
                Gain Strength
              </span>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                Build Muscle
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile.weight || '--'} <span className="text-lg font-normal text-muted-foreground">kg</span></div>
            <p className="text-xs text-muted-foreground mt-1 text-[10px]">Updated recently</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            <Button variant="ghost" className="justify-between h-14 px-6 rounded-none">
              <div className="flex items-center">
                <History className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>Exercise History</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Separator />
            <Button variant="ghost" className="justify-between h-14 px-6 rounded-none">
              <div className="flex items-center">
                <Bell className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Separator />
            <Button variant="ghost" className="justify-between h-14 px-6 rounded-none">
              <div className="flex items-center">
                <ShieldCheck className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>Privacy</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Separator />
            <Button variant="ghost" className="justify-between h-14 px-6 rounded-none">
              <div className="flex items-center">
                <CreditCard className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>Subscription</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <span className="text-xs mr-2 bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">PRO</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full h-12" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" /> Log Out
      </Button>
    </div>
  )
}
