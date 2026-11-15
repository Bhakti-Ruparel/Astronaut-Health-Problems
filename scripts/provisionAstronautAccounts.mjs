import { randomBytes } from 'node:crypto'
import { access, appendFile, readFile, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAuthClient } from '@neon/auth'
import dotenv from 'dotenv'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(projectDir, '.env.local') })

const authUrl = process.env.VITE_NEON_AUTH_URL?.trim()
if (!authUrl || !(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL)) {
  throw new Error('VITE_NEON_AUTH_URL and server-only DATABASE_URL are required in .env.local.')
}

const auth = createAuthClient(authUrl, {
  fetchOptions: { headers: { origin: process.env.ASTROMIND_AUTH_ORIGIN ?? 'http://localhost:5173' } },
})
const pythonCommand = process.env.PYTHON_EXECUTABLE || (process.platform === 'win32' ? 'py' : 'python3')
const databaseHelper = path.join(projectDir, 'scripts', 'neon_data.py')
const credentialsPath = path.join(projectDir, 'astronaut-credentials.csv')

function runDatabaseHelper(...args) {
  const result = spawnSync(pythonCommand, [databaseHelper, ...args], {
    cwd: projectDir,
    encoding: 'utf8',
    env: process.env,
  })
  if (result.error || result.status !== 0) {
    const reason = result.stderr?.trim() || result.error?.message || 'Unknown error'
    throw new Error(`Neon database helper failed: ${reason}`)
  }
  return result.stdout.trim()
}

const astronauts = JSON.parse(runDatabaseHelper('astronauts'))
if (astronauts.length === 0) {
  throw new Error('No imported astronaut records found. Run npm run db:import first.')
}

try {
  await access(credentialsPath)
} catch (error) {
  if (error.code !== 'ENOENT') throw error
  await writeFile(credentialsPath, 'astronaut_id,email,temporary_password,auth_user_id\r\n', {
    encoding: 'utf8',
    flag: 'wx',
    mode: 0o600,
  })
}

const savedCredentials = new Map()
const credentialLines = (await readFile(credentialsPath, 'utf8')).split(/\r?\n/).slice(1)
for (const line of credentialLines) {
  if (!line) continue
  const [astronautId, email, password, userId] = line.split(',').map((field) => field.replace(/^"|"$/g, ''))
  if (astronautId && userId) savedCredentials.set(astronautId, { email, password, userId })
}

const csv = (value) => `"${String(value).replaceAll('"', '""')}"`
for (const { astronaut_id: astronautId, auth_user_id: existingUserId } of astronauts) {
  if (existingUserId) continue
  const saved = savedCredentials.get(astronautId)
  if (saved) {
    runDatabaseHelper('bind', saved.userId, astronautId)
    console.log(`Completed the existing account mapping for ${astronautId}.`)
    continue
  }

  const suffix = randomBytes(5).toString('hex')
  const email = `${astronautId.toLowerCase()}-${suffix}@astromind-demo.test`
  const password = randomBytes(24).toString('base64url')
  const result = await auth.signUp.email({
    name: astronautId,
    email,
    password,
  })
  if (result.error) {
    throw new Error(`Could not create the Neon Auth account for ${astronautId}: ${result.error.message}`)
  }
  const userId = result.data?.user?.id
  if (!userId) {
    throw new Error(`Neon Auth did not return a user ID for ${astronautId}.`)
  }

  await appendFile(
    credentialsPath,
    `${[astronautId, email, password, userId].map(csv).join(',')}\r\n`,
    { encoding: 'utf8', mode: 0o600 },
  )
  runDatabaseHelper('bind', userId, astronautId)
  console.log(`Provisioned one account for ${astronautId}. Credentials are in the ignored local file.`)
}

console.log(`Completed. Keep ${credentialsPath} private and distribute credentials securely.`)
