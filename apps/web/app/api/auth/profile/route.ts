import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'
import { createApiClient } from '@/lib/supabase/server'
import { createUserRepo } from '@helix/database'

// export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth()
    const supabase = await createApiClient(request)
    const userRepo = createUserRepo(supabase)
    const profile = await userRepo.getById(userId)

    return NextResponse.json(profile)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth()
    const body = await request.json()
    const supabase = await createApiClient(request)
    const userRepo = createUserRepo(supabase)
    const profile = await userRepo.update(userId, body)

    return NextResponse.json(profile)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  return POST(request)
}
