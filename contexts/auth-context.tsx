import React from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'
import Router from 'next/router'

type SignIn = () => Promise<void>
type SignOut = () => Promise<void>
interface AuthState extends User {
  interval?: string | null
  is_subscribed?: boolean
  stripe_customer?: string
}

const AuthContext = React.createContext<
  | {
      auth: AuthState | null
      signIn: SignIn
      signOut: SignOut
    }
  | undefined
>(undefined)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = React.useState<AuthState | null>(supabase.auth.user())
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
        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
            .from('profile')
            .select('*')
            .eq('id', session.user?.id)
            .single()
          setAuth({ ...session.user, ...profile })
        } else {
          setAuth(null)
        }
      }
    )
    return () => subscription?.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut }}>
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
