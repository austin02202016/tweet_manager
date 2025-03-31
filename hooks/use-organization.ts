import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Organization } from '@/types'

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrganization() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('No user found')
          return
        }

        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error
        setOrganization(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch organization')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [])

  return { organization, loading, error }
} 