'use client'

import { cn } from '@/lib/utils'

interface WorkoutHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function WorkoutHeader({ title, subtitle, className }: WorkoutHeaderProps) {
  return (
    <div className={cn('mb-8 pt-4', className)}>
      <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
