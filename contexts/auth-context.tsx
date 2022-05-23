import React from 'react'
import Router from 'next/router'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'

type SignIn = () => Promise<void>
type SignOut = () => Promise<void>

const AuthContext = React.createContext<
  | {
      auth: User | null
      isLoading: boolean
      signIn: SignIn
      signOut: SignOut
    }
  | undefined
>(undefined)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = React.useState<User | null>(supabase.auth.user())
  const [isLoading, setLoading] = React.useState(false)
  const signIn = async () => {
    await supabase.auth.signIn({ provider: 'github' })
  }
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    setAuth(null)
    Router.push('/')
  }

  React.useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true)
        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
            .from('profile')
            .select('*')
            .eq('id', session.user?.id)
            .single()
          if (session.user)
            setAuth({
              ...session.user,
              user_metadata: { ...session.user.user_metadata, ...profile },
            })
        } else {
          setAuth(null)
        }
        setLoading(false)
      }
    )
    return () => subscription?.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ auth, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider')
  }
  return context
}

export { AuthProvider, useAuth }
