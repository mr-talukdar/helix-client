'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Dumbbell, User, Users } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/workout') return null;

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Gym', href: '/gym', icon: Users },
    { label: 'Workout', href: '/workout', icon: Dumbbell, isPrimary: true },
    { label: 'Progress', href: '/progress', icon: TrendingUp },
    { label: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/60 pb-safe shadow-lg">
      <div className="flex justify-around items-center h-20 px-4 max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname ? (pathname === item.href || pathname.startsWith(`${item.href}/`)) : false

          if (item.isPrimary) {
            return (
              <Link key={item.href} href={item.href} className="relative -top-5 flex flex-col items-center">
                <div className={`h-16 w-16 flex items-center justify-center rounded-full shadow-lg transition-transform ${isActive ? 'bg-primary transform scale-110 text-primary-foreground' : 'bg-primary/90 text-primary-foreground hover:bg-primary'}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</span>
              </Link>
            )
          }

          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-16 h-full space-y-1">
              <Icon className={`h-6 w-6 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
