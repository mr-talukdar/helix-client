import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Activity, Trophy, Users } from 'lucide-react'
import { BrandLogo } from '@/components/layout/brand-logo'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Background Image overlay from Unsplash */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} 
      />

      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <BrandLogo imageSize={28} textSize="text-lg" />
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary underline-offset-4 hover:underline" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium hover:text-primary underline-offset-4 hover:underline" href="/signup">
            Sign Up
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 z-10">
        <section className="w-full py-24 md:py-32 lg:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6 text-center space-y-8">
            <div className="space-y-4 max-w-3xl mx-auto flex flex-col items-center">
              <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-4">
                🚀 The next evolution in strength training
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Track every rep. <br className="hidden sm:inline" />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Dominate every set.</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                HeliX is the ultimate strength training companion. Log workouts, track progress, and climb your gym's leaderboard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25">
                  Start Training <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-24 bg-muted/40 border-t border-border/40 flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Smart Logging</h3>
                <p className="text-muted-foreground">Log sets, reps, and RPE with precision. Our engine detects new personal records automatically.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Advanced Analytics</h3>
                <p className="text-muted-foreground">Visualize your strength trends over time. See exactly how much volume you're moving.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center sm:col-span-2 lg:col-span-1">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Gym Ecosystem</h3>
                <p className="text-muted-foreground">Join your local gym, climb the improvement-based leaderboard, and share PRs on the activity feed.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="w-full border-t border-border/40 py-6 md:py-8 flex justify-center z-10">
        <div className="container flex flex-col md:flex-row items-center justify-between px-4 md:px-6 gap-4 text-center md:text-left">
          <BrandLogo imageSize={20} textSize="text-base font-semibold" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HeliX Fitness. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
