# AstroMind

NASA-inspired astronaut health monitoring interface (hackathon prototype). All data is fictional, simulated demo data. Not affiliated with or endorsed by NASA. Alerts are monitoring indicators, not medical diagnoses.

## Run
```
npm install
py -m pip install -r requirements.txt
```
Build: `npm run build`. Preview the build: `npm run preview`.

## Deploy to Vercel
The `vercel.json` rewrite supports client-side routes for a static frontend.
That setup does not run this app's Node auth proxy or Python data API; use the
Render Blueprint below to deploy the complete app.

## Neon setup
Managed Better Auth is enabled for the project's default Neon branch. The
ignored `.env.local` needs:

```dotenv
VITE_NEON_AUTH_URL=https://.../neondb/auth
DATABASE_URL=postgresql://...       # server-only; never prefix with VITE_
NEON_AUTH_COOKIE_SECRET=<random secret, at least 32 characters>
ASTROMIND_INTERNAL_TOKEN=<random secret, at least 32 characters>
```

Keep the database URL and both secrets out of browser code and Git. Generate
each secret locally with
`node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`.
The local Vite origin `http://localhost:5173` is configured as a trusted Neon
Auth domain. Add your deployed web origin as a trusted domain in Neon before
deploying. Neon stores identity and sessions in the `neon_auth` schema.

The Node API proxies Neon Auth through the app origin so its HttpOnly session
cookie can also authenticate API requests. Database queries use Python's
Postgres driver and a loopback-only data API. Keep both API processes running
with Vite:

```powershell
npm run data-api
npm run api
npm run dev
```

For production, route `/api/*` to the Node API server and serve the Vite build
from the same origin.

## Deploy to Render
The repository includes a single-service Render Docker setup. It serves the
built web app and routes same-origin `/api/*` requests to the Node auth proxy;
the Python data API stays private inside the container.

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint**, connect the repository, and deploy
   the detected `render.yaml`.
3. In the service's **Environment** settings, set `VITE_NEON_AUTH_URL` (the
   Neon Auth URL) and `DATABASE_URL` (the server-only Neon Postgres connection
   string). The Blueprint generates `NEON_AUTH_COOKIE_SECRET` and
   `ASTROMIND_INTERNAL_TOKEN`.
4. After the first deploy, add the new `https://<service>.onrender.com` origin
   to the trusted origins/domains for Neon Auth. Email verification must remain
   disabled for the demo `.test` accounts.
5. Open the Render service URL and sign in with a provisioned account.

The Blueprint selects Render's free web-service plan for a low-cost demo. Free
services sleep after inactivity and can take about a minute to wake up; choose
a paid plan if the app must remain continuously available. Deployment does not
add a live telemetry producer; the monitoring pages show new live readings
only when a producer writes them to Neon.

## Telemetry import and astronaut accounts
The full CSV (`..\ML_Model\astronaut_health_telemetry_full.csv`) has 7,200
readings for five astronaut IDs. `npm run db:import` applies the app migration,
loads the existing trained model from the sibling `..\astronaut_health_ble`
project, analyzes each row, and idempotently upserts the result into Neon
`astro_reference_telemetry`. This dedicated table keeps the requested CSV
separate from any shared reference data already used by the BLE app. Set
`ASTRONAUT_TELEMETRY_CSV` to override the CSV path.
Install the Python dependencies above and configure `DATABASE_URL` before
running it.

Then run `npm run accounts:provision` to create one Neon Auth login per
astronaut and write the generated email/password pairs to the ignored local
`astronaut-credentials.csv`. These are demo-only `astromind-demo.test` email
addresses and cannot receive email; Neon Auth email verification must be
disabled for these accounts to sign in. Keep the file private and distribute
the temporary passwords securely. The database stores a unique
Neon-user-to-astronaut mapping; the API derives the astronaut from the verified
session and never accepts an astronaut ID from the browser. Account provisioning
uses the Python Postgres driver to connect to Neon.

The existing BLE receiver and model in `..\astronaut_health_ble` write live,
scored readings to the same Neon `health_telemetry` table. Configure that
receiver with the same database URL. To start it, run `py ble_receiver.py` from
the sibling `..\astronaut_health_ble` directory while the phone app is
advertising and streaming. The web API polls Neon every five seconds; the
receiver's current deferred sync interval is 60 seconds, so cloud readings may
appear with that delay. The current phone producer hard-codes live readings to
`ASTR-001`; other astronaut accounts will show their imported history but need
the producer to send their matching ID before they can receive live readings.
Historical CSV rows and live rows are kept distinct in the UI.

## Routes
`/auth` sign-in or account creation, `/` Overview, `/assessment` (supports `?test=reaction|memory|attention`), `/journal`, `/trends`, `/alerts`, `/monitoring`, `/body-map`, `/profile`.

## Features
- Playable Reaction Time (5 trials, premature-click detection), Memory (5 rounds, sequences of 4-8 digits) and Attention (36 symbols, target is the triangle) tests with result panels comparing to the previous run and the personal baseline.
- Health Journal: sleep, sleep quality, fatigue, stress, mood, symptoms, notes. One entry per day; saving again overwrites.
- Health Trends: measured cognitive performance and self-reported data are shown in separate sections, with baseline lines and bands.
- Alerts & Insights: computed from the data (slower reaction, declining memory, decreasing sleep, rising fatigue) with explanations and recommended actions.
- Mission Profile: fictional profile, mission, baseline, history, monitoring preferences, and "Reset demo data".
- Live Monitoring: per-account model output, latest telemetry, anomaly score, flagged features, and recent readings.
- Body Map: keyboard- and pointer-accessible body-region summaries based on the latest assigned telemetry and model flags.

## Data and baseline
A 30-day seeded history (deterministic PRNG) is generated for each signed-in
account and stored in browser localStorage under a user-specific key. App
records are not yet synchronized to Neon and are not shared across browsers.
Existing pre-authentication data under the old shared key is left untouched and
is not assigned to a new account.
The baseline is the mean of the first 14 seeded days and can be recalibrated
from the last 7 days on the Profile page.

The separate telemetry dataset and monitoring pages use Neon. The cognitive
assessment/journal records above remain browser-local.

## Scoring
- Reaction score = clamp(round(100 * (600 - avgMs) / 400), 0, 100)
- Memory score = round(0.7 * accuracy + 0.3 * min(100, maxLength / 8 * 100))
- Attention score = clamp(round(100 * hits / targets - 15 * falseAlarms), 0, 100)

## Reset
Use "Reset demo data" on the Mission Profile page to clear the current
account's local data. See [ARCHITECTURE_WORKFLOW.md](./ARCHITECTURE_WORKFLOW.md)
for the architecture and workflow diagrams.
