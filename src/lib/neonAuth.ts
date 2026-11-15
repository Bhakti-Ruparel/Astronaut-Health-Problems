import { createAuthClient } from '@neon/auth'
import { BetterAuthReactAdapter } from '@neon/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim()

export const neonAuthConfigured = Boolean(authUrl)
export const neonAuthClient = authUrl
  ? createAuthClient(new URL('/api/auth', window.location.origin).toString(), {
      adapter: BetterAuthReactAdapter({
        fetchOptions: { credentials: 'include' },
      }),
    })
  : null
