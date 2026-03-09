import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'
import { createApiClient } from '@/lib/supabase/server'
import { 
  Database,
  createWorkoutRepo, 
  createWorkoutSetRepo, 
  createPersonalRecordRepo, 
  createProgressEventRepo, 
  createActivityEventRepo, 
  createGymMemberRepo,
  createExerciseRepo
} from '@helix/database'
import { createWorkoutEngine, FinishWorkoutInput } from '@helix/engine'

// export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth()
    const body: FinishWorkoutInput = await request.json()

    const supabase = await createApiClient(request)

    // Wire up dependencies
    const engine = createWorkoutEngine({
      workout: createWorkoutRepo(supabase),
      workoutSet: createWorkoutSetRepo(supabase),
      personalRecord: createPersonalRecordRepo(supabase),
      progressEvent: createProgressEventRepo(supabase),
      activityEvent: createActivityEventRepo(supabase),
      gymMember: createGymMemberRepo(supabase),
      exercise: createExerciseRepo(supabase),
    })

    // Execute core logic
    const result = await engine.finishWorkout(userId, body)

    return NextResponse.json(result)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message.startsWith('Invalid workout:')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('API Error Full:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      details: error.details || error.hint || null
    }, { status: 500 })
  }
}
