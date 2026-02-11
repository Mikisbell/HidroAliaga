import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export type Profile = {
    id: string
    full_name: string | null
    avatar_url: string | null
    role: 'user' | 'admin'
    email?: string
}

export function useProfile() {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        async function getProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    setUser(user)

                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()

                    if (data) {
                        setProfile({ ...data, email: user.email })
                        setIsAdmin(data.role === 'admin')
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error)
            } finally {
                setLoading(false)
            }
        }

        getProfile()
    }, [])

    return { user, profile, loading, isAdmin }
}
