import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'
import { createApiClient } from '@/lib/supabase/server'
import { Database, createExerciseRepo } from '@helix/database'

// export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    await verifyAuth() // just checking auth, anon can read exercises too

    const { searchParams } = new URL(request.url)
    const muscleGroup = searchParams.get('muscleGroup') || undefined

    const supabase = await createApiClient(request)

    const exerciseRepo = createExerciseRepo(supabase)
    const exercises = await exerciseRepo.list(muscleGroup)

    return NextResponse.json(exercises)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error', debug: JSON.stringify(error, Object.getOwnPropertyNames(error)) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth()
    const body = await request.json()

    if (!body.name || !body.muscleGroup) {
      return NextResponse.json({ error: 'Missing name or muscleGroup' }, { status: 400 })
    }

    const supabase = await createApiClient(request)

    const exerciseRepo = createExerciseRepo(supabase)
    const exercise = await exerciseRepo.createCustom(userId, body.name, body.muscleGroup)

    return NextResponse.json(exercise)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
