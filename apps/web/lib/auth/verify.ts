import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function verifyAuth() {
  const supabase = await createClient()
  
  // First try to check the Authorization header (useful for API scripts / mobile)
  const reqHeaders = await headers()
  const authHeader = reqHeaders.get('Authorization')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    
    // LOCAL TESTING BACKDOOR: Bypass Supabase Auth rate limits in dev
    if (token.startsWith('test_user_') && process.env.NODE_ENV !== 'production') {
      return token.substring('test_user_'.length)
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (user && !error) return user.id
  }

  // Fallback to standard cookie-based auth
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return user.id
}
