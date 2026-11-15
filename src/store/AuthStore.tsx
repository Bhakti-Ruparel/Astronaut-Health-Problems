import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { neonAuthClient, neonAuthConfigured } from '../lib/neonAuth'

export interface AuthUser {
  id: string
  email: string
  name: string
}

type AuthStatus = 'loading' | 'ready' | 'unconfigured'

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  sessionError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Authentication request failed.'
}

async function readCurrentUser(): Promise<AuthUser | null> {
  if (!neonAuthClient) throw new Error('Neon Auth is not configured.')

  const result = await neonAuthClient.getSession()
  if (result.error) throw new Error(result.error.message)

  const user = result.data?.user
  return user
    ? {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
      }
    : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>(neonAuthConfigured ? 'loading' : 'unconfigured')
  const [sessionError, setSessionError] = useState<string | null>(null)

  const refreshSession = useCallback(async () => {
    try {
      const currentUser = await readCurrentUser()
      setUser(currentUser)
      setSessionError(null)
      setStatus('ready')
    } catch (error) {
      setUser(null)
      setSessionError(errorMessage(error))
      setStatus('ready')
    }
  }, [])

  useEffect(() => {
    if (!neonAuthConfigured) return

    void refreshSession()
    const handleFocus = () => void refreshSession()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void refreshSession()
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refreshSession])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!neonAuthClient) throw new Error('Neon Auth is not configured.')

    const result = await neonAuthClient.signIn.email({ email, password })
    if (result.error) throw new Error(result.error.message)

    const currentUser = await readCurrentUser()
    if (!currentUser) throw new Error('Sign-in completed but no active session was returned.')
    setUser(currentUser)
    setSessionError(null)
    setStatus('ready')
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!neonAuthClient) throw new Error('Neon Auth is not configured.')

    const result = await neonAuthClient.signUp.email({ name, email, password })
    if (result.error) throw new Error(result.error.message)

    const currentUser = await readCurrentUser()
    setUser(currentUser)
    setSessionError(null)
    setStatus('ready')
    return currentUser !== null
  }, [])

  const signOut = useCallback(async () => {
    if (!neonAuthClient) throw new Error('Neon Auth is not configured.')

    const result = await neonAuthClient.signOut()
    if (result.error) throw new Error(result.error.message)
    setUser(null)
    setSessionError(null)
    setStatus('ready')
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, sessionError, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
