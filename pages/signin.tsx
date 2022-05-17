import React from 'react'
import { supabase } from '../utils/supabase'

function SignIn() {
  React.useEffect(() => {
    supabase.auth.signIn({ provider: 'github' })
  }, [])

  return <p>Signing in</p>
}

export default SignIn
