import { useState, type FormEvent } from 'react'
import { ArrowRight, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Wordmark } from '../components/ui/Wordmark'
import { useAuth } from '../store/AuthStore'
import { neonAuthConfigured } from '../lib/neonAuth'

function redirectPath(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) return '/'
  const from = state.from
  if (typeof from !== 'object' || from === null || !('pathname' in from)) return '/'
  const pathname = from.pathname
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.startsWith('//')) return '/'

  const search = 'search' in from && typeof from.search === 'string' ? from.search : ''
  const hash = 'hash' in from && typeof from.hash === 'string' ? from.hash : ''
  return `${pathname}${search}${hash}`
}

export function AuthPage() {
  const { signIn, signUp, sessionError } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setPending(true)

    try {
      if (mode === 'sign-up') {
        const signedIn = await signUp(name.trim(), email.trim(), password)
        if (signedIn) {
          navigate(redirectPath(location.state), { replace: true })
        } else {
          setMode('sign-in')
          setNotice('Account created. Sign in to continue; verify your email first if requested.')
        }
      } else {
        await signIn(email.trim(), password)
        navigate(redirectPath(location.state), { replace: true })
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Authentication request failed.',
      )
    } finally {
      setPending(false)
    }
  }

  function changeMode(nextMode: 'sign-in' | 'sign-up') {
    setMode(nextMode)
    setError(null)
    setNotice(null)
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <section className="glass-strong w-full max-w-md p-6 sm:p-8" aria-labelledby="auth-title">
        <Link to="/" className="mb-8 inline-flex rounded-full" aria-label="AstroMind">
          <Wordmark />
        </Link>
        <div className="mb-6">
          <div className="label-mono mb-2 flex items-center gap-2">
            <ShieldCheck size={14} aria-hidden="true" /> Neon-secured workspace
          </div>
          <h1 id="auth-title" className="text-3xl font-semibold">
            {mode === 'sign-up' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to access your private AstroMind health workspace.
          </p>
        </div>

        {!neonAuthConfigured && (
          <div className="mb-5 rounded-xl border border-orange/40 bg-orange/10 p-3 text-sm text-orange-100" role="alert">
            Set <code>VITE_NEON_AUTH_URL</code> in <code>.env.local</code> to connect this app to Neon Auth.
          </div>
        )}
        {sessionError && (
          <div className="mb-5 rounded-xl border border-orange/40 bg-orange/10 p-3 text-sm text-orange-100" role="alert">
            Could not restore the Neon session: {sessionError}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl border border-orange/40 bg-orange/10 p-3 text-sm text-orange-100" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-5 rounded-xl border border-cyan/40 bg-cyan/10 p-3 text-sm text-cyan-bright" role="status">
            {notice}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'sign-up' && (
            <label className="block text-sm" htmlFor="auth-name">
              Name
              <input
                id="auth-name"
                name="name"
                autoComplete="name"
                required
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-void/50 px-3 text-white placeholder:text-muted/70"
                placeholder="Crew member"
              />
            </label>
          )}
          <label className="block text-sm" htmlFor="auth-email">
            Email
            <input
              id="auth-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-void/50 px-3 text-white placeholder:text-muted/70"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm" htmlFor="auth-password">
            Password
            <input
              id="auth-password"
              type="password"
              name="password"
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-void/50 px-3 text-white placeholder:text-muted/70"
              placeholder="At least 8 characters"
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={pending || !neonAuthConfigured}
          >
            {pending ? (
              <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
            ) : (
              <LockKeyhole size={16} aria-hidden="true" />
            )}
            {mode === 'sign-up' ? 'Create account' : 'Sign in'}
            {!pending && <ArrowRight size={16} aria-hidden="true" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {mode === 'sign-up' ? 'Already have an account?' : 'New to AstroMind?'}{' '}
          <button
            type="button"
            className="font-semibold text-cyan-bright underline-offset-4 hover:underline"
            onClick={() => changeMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}
          >
            {mode === 'sign-up' ? 'Sign in' : 'Create an account'}
          </button>
        </p>
        <p className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-muted">
          Demo health history is fictional. Monitoring indicators are not medical diagnoses.
        </p>
      </section>
    </main>
  )
}
