// Screenshot + game walkthrough QA for AstroMind. Dev tooling only (playwright is a devDependency).
// Usage: npm run build; npx vite preview --port 4173 --strictPort (background); node scripts/shots.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const OUT = process.env.SHOTS_DIR ?? 'd:/Nasa/.agents/tasks/shots'
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  { w: 1440, h: 900 },
  { w: 390, h: 844 },
]
const ROUTES = [
  ['home', '/'],
  ['assessment', '/assessment'],
  ['journal', '/journal'],
  ['trends', '/trends'],
  ['alerts', '/alerts'],
  ['profile', '/profile'],
]

const problems = []
const log = (...a) => console.log(...a)
const fail = (m) => {
  problems.push(m)
  console.log('FAIL:', m)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const launchOpts = { headless: true }
let browser
try {
  browser = await chromium.launch(launchOpts)
} catch (e) {
  log('chromium launch failed, trying msedge:', e.message.split('\n')[0])
  browser = await chromium.launch({ ...launchOpts, channel: 'msedge' })
}

async function newPage(vp, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, ...extra })
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error') fail(`console error @${vp.w}: ${m.text()}`)
  })
  page.on('pageerror', (e) => fail(`pageerror @${vp.w}: ${e.message}`))
  page.on('dialog', (d) => d.accept())
  return { ctx, page }
}

const count = (page) =>
  page.evaluate(() => {
    const raw = localStorage.getItem('astromind:v1')
    if (!raw) return 0
    try {
      return (JSON.parse(raw).assessments ?? []).length
    } catch {
      return -1
    }
  })

async function overflow(page, label) {
  const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  if (o.sw > o.iw) fail(`horizontal overflow on ${label}: scrollWidth ${o.sw} > ${o.iw}`)
}

// ---------- 1. page screenshots ----------
let shots = 0
for (const vp of VIEWPORTS) {
  const { ctx, page } = await newPage(vp)
  for (const [name, path] of ROUTES) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    await sleep(900) // let first-load skeletons finish
    await overflow(page, `${path}@${vp.w}`)
    await page.screenshot({ path: `${OUT}/${name}-${vp.w}.png` })
    shots++
  }
  await ctx.close()
}
{
  const { ctx, page } = await newPage(VIEWPORTS[0], { reducedMotion: 'reduce' })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await sleep(500)
  await page.screenshot({ path: `${OUT}/home-reduced-motion-1440.png` })
  shots++
  await ctx.close()
}
log(`screens captured: ${shots}`)

// ---------- 2. games ----------
async function openGame(page, type) {
  await page.goto(`${BASE}/assessment?test=${type}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Begin countdown/ }).waitFor({ timeout: 8000 })
}
async function beginCountdown(page, shot) {
  if (shot) await page.screenshot({ path: `${shot}-instructions.png` })
  await page.getByRole('button', { name: /Begin countdown/ }).click()
  await sleep(1200)
  if (shot) await page.screenshot({ path: `${shot}-countdown.png` })
}
const resultVisible = (page) => page.locator('[aria-label$=" results"]').first()

async function abortCheck(page, type) {
  const before = await count(page)
  await openGame(page, type)
  await beginCountdown(page)
  await sleep(2500)
  await page.keyboard.press('Escape')
  await sleep(400)
  // a confirm popover may appear while playing
  const confirm = page.getByRole('alertdialog')
  if (await confirm.count()) {
    await confirm.getByRole('button', { name: /abort|exit|yes/i }).first().click()
    await sleep(400)
  }
  const after = await count(page)
  const hub = await page.getByText('Available missions', { exact: false }).count()
  const hubLabel = await page.locator('[aria-label="Available missions"]').count()
  if (after !== before) fail(`${type}: abort saved an assessment (${before} -> ${after})`)
  if (!hub && !hubLabel) fail(`${type}: abort did not return to hub`)
  log(`abort ${type}: ok (count ${before} -> ${after})`)
}

const gameResults = []
for (const vp of VIEWPORTS) {
  const tag = `${vp.w}`
  const { ctx, page } = await newPage(vp)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })

  // reaction
  {
    const before = await count(page)
    await openGame(page, 'reaction')
    await beginCountdown(page, `${OUT}/game-reaction-${tag}`)
    let sawTooSoon = false
    let early = false
    const t0 = Date.now()
    let shotIn = false
    let pressed = 0
    while (Date.now() - t0 < 60000 && pressed < 5) {
      if (!early) {
        await page.locator('[aria-label^="Reaction arena"]').waitFor({ timeout: 10000 })
        await sleep(400)
        const txt = await page.locator('body').innerText()
        if (!/TAP NOW!/.test(txt)) {
          await page.keyboard.press('Space')
          early = true
          await sleep(250)
          if (/Too soon/i.test(await page.locator('body').innerText())) sawTooSoon = true
          if (!shotIn) {
            await page.screenshot({ path: `${OUT}/game-reaction-${tag}-toosoon.png` })
          }
          await sleep(1800)
          continue
        }
      }
      const go = page.getByText('TAP NOW!').first()
      try {
        await go.waitFor({ state: 'visible', timeout: 9000 })
      } catch {
        continue
      }
      // screenshot only on the last trial so it doesn't slow the measured responses before it
      if (pressed === 4) await page.screenshot({ path: `${OUT}/game-reaction-${tag}-go.png` })
      await page.keyboard.press('Space')
      pressed++
      await sleep(900)
    }
    try {
      await resultVisible(page).waitFor({ timeout: 15000 })
      await sleep(900)
      await page.screenshot({ path: `${OUT}/game-reaction-${tag}-result.png` })
    } catch {
      fail(`reaction@${tag}: no result screen`)
    }
    const after = await count(page)
    if (after !== before + 1) fail(`reaction@${tag}: assessments ${before} -> ${after}`)
    if (!sawTooSoon) fail(`reaction@${tag}: "Too soon" not observed`)
    gameResults.push(`reaction@${tag}: ${before} -> ${after}, tooSoon=${sawTooSoon}`)
    await overflow(page, `reaction result@${tag}`)
  }

  // memory
  {
    const before = await count(page)
    await openGame(page, 'memory')
    await beginCountdown(page, `${OUT}/game-memory-${tag}`)
    let rounds = 0
    let shotShow = false
    const t0 = Date.now()
    while (Date.now() - t0 < 120000) {
      if (await resultVisible(page).count()) break
      // show phase: sample digit tile
      const tile = page.locator('div.font-display[aria-hidden="true"].text-7xl')
      if (await tile.count()) {
        const seq = []
        let last = ''
        const s0 = Date.now()
        while (Date.now() - s0 < 25000) {
          if (!(await tile.count())) break
          const t = ((await tile.first().textContent().catch(() => '')) ?? '').trim()
          if (t !== last) {
            if (/^[0-9]$/.test(t)) {
              seq.push(t)
              if (!shotShow) {
                await page.screenshot({ path: `${OUT}/game-memory-${tag}-show.png` })
                shotShow = true
              }
            }
            last = t
          }
          await sleep(30)
        }
        // recall phase
        await page.locator('[aria-label^="Entered"]').waitFor({ timeout: 5000 }).catch(() => {})
        const need = await page.locator('[aria-label^="Entered"]').getAttribute('aria-label').catch(() => '')
        const m = /of (\d+)/.exec(need ?? '')
        if (m && Number(m[1]) !== seq.length) fail(`memory@${tag}: sampled ${seq.length} digits, expected ${m[1]}`)
        await page.evaluate(() => document.activeElement?.blur?.())
        if (rounds === 0) {
          for (const d of seq.slice(0, Math.max(0, seq.length - 1))) await page.keyboard.press(d)
          await page.screenshot({ path: `${OUT}/game-memory-${tag}-recall.png` })
          await page.keyboard.press(seq[seq.length - 1])
        } else {
          for (const d of seq) await page.keyboard.press(d)
        }
        rounds++
        await sleep(300)
      } else {
        await sleep(100)
      }
    }
    try {
      await resultVisible(page).waitFor({ timeout: 8000 })
      await sleep(900)
      await page.screenshot({ path: `${OUT}/game-memory-${tag}-result.png` })
    } catch {
      fail(`memory@${tag}: no result screen`)
    }
    const txt = await page.locator('body').innerText()
    if (!/100(\.0)?\s*%/.test(txt)) fail(`memory@${tag}: expected 100% accuracy on result`)
    const after = await count(page)
    if (after !== before + 1) fail(`memory@${tag}: assessments ${before} -> ${after}`)
    gameResults.push(`memory@${tag}: ${before} -> ${after}, rounds=${rounds}`)
    await overflow(page, `memory result@${tag}`)
  }

  // attention
  {
    const before = await count(page)
    await openGame(page, 'attention')
    await beginCountdown(page, `${OUT}/game-attention-${tag}`)
    await page.evaluate(() => document.activeElement?.blur?.())
    const t0 = Date.now()
    let shot = false
    while (Date.now() - t0 < 120000) {
      if (await resultVisible(page).count()) break
      const item = page.locator('div.font-display[aria-hidden="true"].text-8xl')
      if (await item.count()) {
        const t = ((await item.first().textContent().catch(() => '')) ?? '').trim()
        // respond to targets only, plus one deliberate false alarm
        if (t === '▲' || (!shot && Date.now() - t0 > 6000)) {
          await sleep(120)
          await page.keyboard.press('Space')
          if (!shot) {
            await page.screenshot({ path: `${OUT}/game-attention-${tag}-ingame.png` })
            shot = true
          }
          await sleep(500)
        }
      }
      await sleep(40)
    }
    try {
      await resultVisible(page).waitFor({ timeout: 8000 })
      await sleep(900)
      await page.screenshot({ path: `${OUT}/game-attention-${tag}-result.png` })
    } catch {
      fail(`attention@${tag}: no result screen`)
    }
    const after = await count(page)
    if (after !== before + 1) fail(`attention@${tag}: assessments ${before} -> ${after}`)
    gameResults.push(`attention@${tag}: ${before} -> ${after}`)
    await overflow(page, `attention result@${tag}`)
  }

  // aborts
  for (const t of ['reaction', 'memory', 'attention']) await abortCheck(page, t)
  await ctx.close()
}

// ---------- 3. regression ----------
{
  const { ctx, page } = await newPage(VIEWPORTS[0])
  await page.goto(BASE + '/alerts', { waitUntil: 'networkidle' })
  const body = await page.locator('main').innerText()
  const cards = await page.locator('article').count()
  if (cards !== 3) fail(`alerts: expected 3 seeded indicators, got ${cards}`)
  if (!body.includes('Monitoring indicators, not medical diagnoses.')) fail('alerts: disclaimer missing')

  // journal submit
  await page.goto(BASE + '/journal', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /check-in/i }).first().click()
  await page.getByText('Check-in saved for today.').waitFor({ timeout: 3000 }).catch(() => fail('journal: no saved confirmation'))
  if (!(await page.locator('table tbody tr').filter({ hasText: 'You' }).count())) fail('journal: saved entry not listed as You')

  // preferences persist across reload
  await page.goto(BASE + '/profile', { waitUntil: 'networkidle' })
  const sw = page.getByRole('switch', { name: 'Daily check-in reminder' })
  const was = await sw.getAttribute('aria-checked')
  await sw.click()
  await page.reload({ waitUntil: 'networkidle' })
  const now = await page.getByRole('switch', { name: 'Daily check-in reminder' }).getAttribute('aria-checked')
  if (was === now) fail('profile: preference did not persist')

  // recalibrate
  const cal = () => page.evaluate(() => JSON.parse(localStorage.getItem('astromind:v1') ?? '{}').baseline?.calibratedAt)
  const calBefore = await cal()
  await sleep(50)
  await page.getByRole('button', { name: /Recalibrate/ }).click()
  await sleep(400)
  const calAfter = await cal()
  if (!calAfter || calAfter === calBefore) fail(`recalibrate: calibratedAt unchanged (${calBefore})`)
  log(`recalibrate: ${calBefore} -> ${calAfter}`)

  // reset demo data
  await page.getByRole('button', { name: /Reset demo data/ }).click()
  await sleep(600)
  const resetCount = await count(page)
  log(`after reset assessments=${resetCount}`)
  await page.goto(BASE + '/journal', { waitUntil: 'networkidle' })
  if (await page.locator('table tbody tr').filter({ hasText: 'You' }).count()) fail('reset: user journal entries remain')
  await ctx.close()
}

await browser.close()
log('\n--- game results ---')
gameResults.forEach((r) => log(r))
log(`\nSUMMARY: ${shots} screens, ${problems.length} problem(s)`)
problems.forEach((p) => log(' -', p))
process.exit(problems.length ? 1 : 0)
