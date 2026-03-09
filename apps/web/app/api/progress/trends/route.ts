import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'
import { createApiClient } from '@/lib/supabase/server'
import { Database, createWorkoutRepo, createWorkoutSetRepo, createPersonalRecordRepo, createProgressEventRepo } from '@helix/database'
import { createProgressEngine } from '@helix/engine'

// export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth()

    const { searchParams } = new URL(request.url)
    const exerciseId = searchParams.get('exerciseId')
    const days = parseInt(searchParams.get('days') || '90', 10)

    if (!exerciseId) {
      return NextResponse.json({ error: 'Missing exerciseId' }, { status: 400 })
    }

    const supabase = await createApiClient(request)

    const engine = createProgressEngine({
      workout: createWorkoutRepo(supabase),
      workoutSet: createWorkoutSetRepo(supabase),
      personalRecord: createPersonalRecordRepo(supabase),
      progressEvent: createProgressEventRepo(supabase),
    })

    const trends = await engine.getStrengthTrends(userId, exerciseId, days)
    return NextResponse.json(trends)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
