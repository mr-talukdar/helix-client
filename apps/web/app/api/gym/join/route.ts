import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'
import { createApiClient } from '@/lib/supabase/server'
import { Database, createGymRepo, createGymMemberRepo, createProgressEventRepo, createActivityEventRepo, createUserRepo } from '@helix/database'
import { createGymEngine } from '@helix/engine'

// export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth()
    const body = await request.json()
    const { gymId } = body

    if (!gymId) {
      return NextResponse.json({ error: 'Missing gymId' }, { status: 400 })
    }

    const supabase = await createApiClient(request)
    const gymMemberRepo = createGymMemberRepo(supabase)

    const isMember = await gymMemberRepo.isMember(userId, gymId)
    
    if (isMember) {
      // If already a member, treat as a success rather than an error for idempotency
      return NextResponse.json({ success: true, message: 'Already a member' })
    }

    const engine = createGymEngine({
      gym: createGymRepo(supabase),
      gymMember: createGymMemberRepo(supabase),
      progressEvent: createProgressEventRepo(supabase),
      activityEvent: createActivityEventRepo(supabase),
      user: createUserRepo(supabase),
    })

    const membership = await engine.joinGym(userId, gymId)
    return NextResponse.json(membership)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
