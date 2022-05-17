import React from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabase'

function SignOut() {
  const router = useRouter()

  React.useEffect(() => {
    const signOut = async () => {
      await supabase.auth.signOut()
      router.push('/')
    }
    signOut()
  }, [])

  return <p>Signing Out</p>
}

export default SignOut
