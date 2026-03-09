import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'
import { createApiClient } from '@/lib/supabase/server'
import { Database, createGymRepo, createGymMemberRepo, createProgressEventRepo, createActivityEventRepo, createUserRepo } from '@helix/database'
import { createGymEngine } from '@helix/engine'

// export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    await verifyAuth()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    const supabase = await createApiClient(request)

    const engine = createGymEngine({
      gym: createGymRepo(supabase),
      gymMember: createGymMemberRepo(supabase),
      progressEvent: createProgressEventRepo(supabase),
      activityEvent: createActivityEventRepo(supabase),
      user: createUserRepo(supabase),
    })

    const gyms = await engine.searchGyms(query)
    return NextResponse.json(gyms)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
