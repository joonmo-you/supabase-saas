import React from 'react'
import { useAuth } from '../contexts/auth-context'

function SignOut() {
  const { signOut } = useAuth()

  React.useEffect(() => {
    signOut()
  }, [])

  return <p>Signing Out</p>
}

export default SignOut
