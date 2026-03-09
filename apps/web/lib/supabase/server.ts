import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@helix/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Specialized client for API routes that need to respect incoming Authorization Bearer tokens.
 * This bridges headless testing (and mobile apps) with Row-Level Security.
 */
export async function createApiClient(request: Request) {
  const cookieStore = await cookies()
  
  // Extract token from request headers if present
  const authHeader = request.headers.get('Authorization')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    
    // LOCAL TESTING BACKDOOR: If using our mock testing token, return a service role client 
    // to bypass RLS since mock tokens aren't valid JWTs.
    if (token.startsWith('test_user_') && process.env.NODE_ENV !== 'production') {
      return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service key to bypass RLS in test script
        {
          cookies: { get() { return undefined }, set() {}, remove() {} },
        }
      )
    }

    // Otherwise, it's a real token (from mobile or some non-cookie client). Let Supabase parse it.
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } },
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set() {}, remove() {},
        },
      }
    )
  }

  // Default fallback (uses cookies)
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set() {}, remove() {},
      },
    }
  )
}
