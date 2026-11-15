import { AsyncLocalStorage } from 'node:async_hooks'
import { createServer } from 'node:http'
import { createAuthServer, handleAuthProxyRequest } from '@neon/auth/server'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(projectDir, '.env.local') })

const authUrl = process.env.VITE_NEON_AUTH_URL?.trim()
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET?.trim()
if (!authUrl) throw new Error('VITE_NEON_AUTH_URL is missing from .env.local.')
if (!cookieSecret || cookieSecret.length < 32) {
  throw new Error('NEON_AUTH_COOKIE_SECRET must contain at least 32 characters.')
}

const requestStorage = new AsyncLocalStorage()
const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
const internalToken = process.env.ASTROMIND_INTERNAL_TOKEN?.trim()
const auth = createAuthServer({
  baseUrl: authUrl,
  cookieSecret,
  sameSite: 'lax',
  context: () => {
    const state = requestStorage.getStore()
    if (!state) throw new Error('No request context is available for Neon Auth.')
    return {
      getCookies: () => state.request.headers.get('cookie') ?? '',
      setCookie: (name, value, options) => state.setCookies.push(serializeCookie(name, value, options)),
      getHeader: (name) => state.request.headers.get(name),
      getOrigin: () =>
        state.request.headers.get('origin') ?? new URL(state.request.url).origin,
      getFramework: () => 'astromind-node',
    }
  },
})

const MAX_BODY_BYTES = 1_000_000

function serializeCookie(name, value, options) {
  const parts = [`${name}=${value}`]
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.domain) parts.push(`Domain=${options.domain}`)
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`)
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`)
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
  return parts.join('; ')
}

async function toWebRequest(request) {
  const host = request.headers.host ?? '127.0.0.1:8787'
  const url = new URL(request.url, `http://${host}`)
  const headers = new Headers()
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) headers.set(name, value.join(', '))
    else if (value !== undefined) headers.set(name, value)
  }
  let body
  if (!['GET', 'HEAD'].includes(request.method ?? 'GET')) {
    const chunks = []
    let length = 0
    for await (const chunk of request) {
      length += chunk.length
      if (length > MAX_BODY_BYTES) throw new Error('Request body is too large.')
      chunks.push(chunk)
    }
    if (length) body = Buffer.concat(chunks)
  }
  return new Request(url, {
    method: request.method,
    headers,
    ...(body ? { body, duplex: 'half' } : {}),
  })
}

async function writeWebResponse(response, nodeResponse, extraCookies = []) {
  const headers = {}
  response.headers.forEach((value, name) => {
    if (name.toLowerCase() !== 'set-cookie') headers[name] = value
  })
  const proxyCookies = response.headers.getSetCookie?.() ?? []
  const cookies = [...proxyCookies, ...extraCookies]
  if (cookies.length) headers['set-cookie'] = cookies
  nodeResponse.writeHead(response.status, headers)
  const body = await response.arrayBuffer()
  nodeResponse.end(Buffer.from(body))
}

function sendJson(response, status, value, cookies = []) {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  if (cookies.length) headers['set-cookie'] = cookies
  response.writeHead(status, headers)
  response.end(JSON.stringify(value))
}

async function handleMonitoring(response, state) {
  const sessionResult = await requestStorage.run(state, () => auth.getSession())
  if (sessionResult.error) {
    sendJson(response, 502, { error: 'Could not verify the Neon session.' }, state.setCookies)
    return
  }
  const userId = sessionResult.data?.user?.id
  if (!userId) {
    sendJson(response, 401, { error: 'Sign in to view astronaut monitoring data.' }, state.setCookies)
    return
  }

  if (!databaseUrl || !internalToken) {
    sendJson(response, 503, { error: 'Server-side monitoring configuration is incomplete.' }, state.setCookies)
    return
  }

  try {
    const dataResponse = await fetch('http://127.0.0.1:8788/internal/monitoring', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${internalToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    const data = await dataResponse.json()
    sendJson(response, dataResponse.status, data, state.setCookies)
  } catch (error) {
    console.error(`Monitoring data API failed (${error?.constructor?.name ?? 'UnknownError'}).`)
    sendJson(response, 503, { error: 'Monitoring data is unavailable. Ensure the Python data API is running.' }, state.setCookies)
  }
}

const server = createServer(async (request, response) => {
  let webRequest
  try {
    webRequest = await toWebRequest(request)
    const url = new URL(webRequest.url)
    if (url.pathname === '/api/health' && request.method === 'GET') {
      sendJson(response, 200, {
        authConfigured: Boolean(authUrl),
        databaseConfigured: Boolean(databaseUrl),
        telemetryApiConfigured: Boolean(internalToken),
      })
      return
    }

    if (url.pathname === '/api/auth' || url.pathname.startsWith('/api/auth/')) {
      const path = url.pathname.replace(/^\/api\/auth\/?/, '')
      const proxyResponse = await handleAuthProxyRequest({
        request: webRequest,
        path,
        baseUrl: authUrl,
        cookieSecret,
        sameSite: 'lax',
      })
      await writeWebResponse(proxyResponse, response)
      return
    }

    if (url.pathname === '/api/monitoring' && request.method === 'GET') {
      const state = { request: webRequest, setCookies: [] }
      await handleMonitoring(response, state)
      return
    }

    sendJson(response, 404, { error: 'Not found.' })
  } catch (error) {
    console.error(`API request failed (${error?.constructor?.name ?? 'UnknownError'}).`)
    if (!response.headersSent) sendJson(response, 500, { error: 'The API request could not be completed.' })
    else response.end()
  }
})

server.listen(8787, '127.0.0.1', () => {
  console.log('AstroMind API listening on http://127.0.0.1:8787')
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
  })
}
