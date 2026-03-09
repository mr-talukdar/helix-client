import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'
import { createApiClient } from '@/lib/supabase/server'
import { Database, createGymRepo, createGymMemberRepo, createProgressEventRepo, createActivityEventRepo, createUserRepo } from '@helix/database'
import { createGymEngine } from '@helix/engine'

// export const runtime = 'edge'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth()
    const resolvedParams = await context.params
    const { id: gymId } = resolvedParams

    const supabase = await createApiClient(request)

    const engine = createGymEngine({
      gym: createGymRepo(supabase),
      gymMember: createGymMemberRepo(supabase),
      progressEvent: createProgressEventRepo(supabase),
      activityEvent: createActivityEventRepo(supabase),
      user: createUserRepo(supabase),
    })

    const gym = await engine.getGym(gymId)
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    // Check membership status
    const gymMemberRepo = createGymMemberRepo(supabase)
    const isMember = await gymMemberRepo.isMember(userId, gymId)

    return NextResponse.json({ gym, isMember })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
