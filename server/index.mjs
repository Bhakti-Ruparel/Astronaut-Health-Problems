import { createServer } from 'node:http'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(projectDir, '.env.local') })

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
const internalToken = process.env.ASTROMIND_INTERNAL_TOKEN?.trim()
const MAX_BODY_BYTES = 1_000_000

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

function sendJson(response, status, value) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  response.end(JSON.stringify(value))
}

async function handleMonitoring(response, url) {
  if (!internalToken) {
    sendJson(response, 503, { error: 'Server-side monitoring configuration is incomplete.' })
    return
  }
  const astronautId = url.searchParams.get('astronautId') ?? 'C001'
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(astronautId)) {
    sendJson(response, 400, { error: 'Astronaut ID contains unsupported characters.' })
    return
  }
  try {
    const dataResponse = await fetch('http://127.0.0.1:8788/internal/monitoring', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${internalToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ astronautId }),
    })
    const data = await dataResponse.json()
    sendJson(response, dataResponse.status, data)
  } catch (error) {
    console.error(`Monitoring data API failed (${error?.constructor?.name ?? 'UnknownError'}).`)
    sendJson(response, 503, { error: 'Monitoring data is unavailable. Ensure the Python data API is running.' })
  }
}

const server = createServer(async (request, response) => {
  try {
    const webRequest = await toWebRequest(request)
    const url = new URL(webRequest.url)
    if (url.pathname === '/api/health' && request.method === 'GET') {
      sendJson(response, 200, {
        databaseConfigured: Boolean(databaseUrl),
        telemetryApiConfigured: Boolean(internalToken),
      })
      return
    }
    if (url.pathname === '/api/monitoring' && request.method === 'GET') {
      await handleMonitoring(response, url)
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
