import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createUserRepo } from '@helix/database'
import { AppLayout } from '../app-layout'

export default async function AppRouteGroup({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Auth Guard
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // 1.5. Onboarding Guard
  const userRepo = createUserRepo(supabase)
  const profile = await userRepo.getById(user.id)
  
  // If the user hasn't finished the onboarding flow, redirect them.
  if (!profile || !profile.height || !profile.weight || !profile.experienceLevel) {
    redirect('/onboarding/gender')
  }

  // 2. Render App Shell
  return (
    <AppLayout>
      {children}
    </AppLayout>
  )
}
