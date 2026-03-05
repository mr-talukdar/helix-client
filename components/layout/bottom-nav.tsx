'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Dumbbell, TrendingUp, User, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from './theme-provider'

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/workout',
    label: 'Workout',
    icon: Dumbbell,
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: TrendingUp,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card">
      <div className="flex items-center justify-around h-20 max-w-md mx-auto sm:max-w-2xl md:max-w-4xl">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-6 w-6" />
          ) : (
            <Sun className="h-6 w-6" />
          )}
          <span className="text-xs font-medium">Theme</span>
        </button>
      </div>
    </nav>
  )
}
