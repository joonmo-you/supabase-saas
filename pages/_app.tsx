import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Nav from '../components/Nav'
import { AuthProvider } from '../contexts/auth-context'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Nav />
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default MyApp
