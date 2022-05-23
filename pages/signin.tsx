import React from 'react'
import { useAuth } from '../contexts/auth-context'

function SignIn() {
  const { signIn } = useAuth()

  React.useEffect(() => {
    signIn()
  }, [])

  return <p>Signing in</p>
}

export default SignIn
