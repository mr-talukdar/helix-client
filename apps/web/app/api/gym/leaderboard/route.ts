import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'
import { createApiClient } from '@/lib/supabase/server'
import { Database, createGymRepo, createGymMemberRepo, createProgressEventRepo, createActivityEventRepo, createUserRepo } from '@helix/database'
import { createGymEngine } from '@helix/engine'

// export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth()

    const { searchParams } = new URL(request.url)
    let gymId = searchParams.get('gymId')
    const timeframe = searchParams.get('timeframe') || undefined

    const supabase = await createApiClient(request)

    // If no gymId provided, get the user's current gym
    if (!gymId) {
      const gymMemberRepo = createGymMemberRepo(supabase)
      const membership = await gymMemberRepo.getUserGym(userId)
      if (!membership) {
        return NextResponse.json({ error: 'User is not in a gym' }, { status: 404 })
      }
      gymId = membership.gymId
    }

    const engine = createGymEngine({
      gym: createGymRepo(supabase),
      gymMember: createGymMemberRepo(supabase),
      progressEvent: createProgressEventRepo(supabase),
      activityEvent: createActivityEventRepo(supabase),
      user: createUserRepo(supabase),
    })

    const leaderboard = await engine.getLeaderboard(gymId, timeframe)
    return NextResponse.json(leaderboard)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
