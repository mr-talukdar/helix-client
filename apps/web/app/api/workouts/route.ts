import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'
import { createApiClient } from '@/lib/supabase/server'
import { Database, createWorkoutRepo } from '@helix/database'

// export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    
    // We instantiate the specific repo needed
    const supabase = await createApiClient(request)

    const workoutRepo = createWorkoutRepo(supabase)
    const workouts = await workoutRepo.listByUser(userId, limit)

    return NextResponse.json(workouts)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
