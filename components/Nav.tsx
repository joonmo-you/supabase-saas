import Link from 'next/link'
import { useAuth } from '../contexts/auth-context'

function Nav() {
  const { auth } = useAuth()

  return (
    <nav className="flex border-b border-gray-200 px-6 py-4">
      <Link href="/">
        <a className="mr-2">Home</a>
      </Link>
      <Link href="/subscription">
        <a>Plans</a>
      </Link>
      <Link href={auth ? '/signout' : '/signin'}>
        <a className="ml-auto">{auth ? 'Sign Out' : 'Sign In'}</a>
      </Link>
    </nav>
  )
}

export default Nav
