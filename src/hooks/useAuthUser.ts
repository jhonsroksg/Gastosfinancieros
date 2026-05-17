import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAuthUser() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then((res: any) => {
      setUser(res.data?.user || null)
    })
  }, [])

  return user
}
