import { createBrowserClient } from '@supabase/ssr'
import { createMockSupabaseClient } from './mockClient'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://'))

  if (!isValidUrl || !key || key.includes('your-anon-key') || key === '') {
    return createMockSupabaseClient() as any
  }

  return createBrowserClient(url, key)
}
