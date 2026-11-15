# AstroMind Architecture and Workflow

> AstroMind is a fictional-data monitoring prototype. BLE/model processing runs in the sibling `astronaut_health_ble` project; its live readings are synced to Neon and read by this web app.

## Architecture

```mermaid
flowchart LR
    H[Health monitoring device]
    BLE[BLE receiver + anomaly model]
    UI[AstroMind React + TypeScript web app]
    API[Node API<br/>same-origin auth proxy + session verification]
    DATA[Python data API<br/>loopback-only + scoped queries]
    AUTH[Neon Managed Auth<br/>user accounts and sessions]
    DB[(Neon Postgres<br/>auth, reference + live telemetry)]
    LOCAL[(Browser localStorage<br/>app data scoped by signed-in user)]

    H -->|BLE| BLE
    BLE -->|Isolation Forest + thresholds| DB
    UI <-->|same-origin auth proxy| API
    API <-->|verify session| AUTH
    AUTH <--> DB
    API -->|verified user ID + internal token| DATA
    DATA -->|resolve astronaut ID; filter all readings| DB
    UI <-->|assessments, journal, preferences| LOCAL
    UI --> ALERTS[Trends and monitoring indicators]
    LOCAL --> ALERTS
```

### Responsibilities

- **Health monitoring devices and BLE receiver:** The sibling `astronaut_health_ble` project receives readings, runs `anomaly_model.py`, and syncs model output to Neon `health_telemetry`.
- **AstroMind web app:** React/Vite UI for cognitive assessments, health journal, trends, alerts, and profile.
- **Node API:** Proxies Neon Auth on the app origin and verifies the current session before forwarding its user ID to the loopback-only data API. The browser cannot choose an astronaut ID for data queries.
- **Python data API:** Uses the server-only Postgres connection to resolve `astronaut_web_accounts` and query only the mapped astronaut's readings. Its internal token is never exposed to the browser.
- **Neon Managed Auth:** Verifies email/password credentials and maintains user sessions in the Neon `neon_auth` schema.
- **Neon telemetry:** `astro_reference_telemetry` stores this app's model-scored CSV history; `health_telemetry` stores live receiver readings. The API returns only records matching the authenticated user's assigned astronaut ID.
- **Browser storage:** Stores the cognitive assessment, journal, preference, and seeded demo records under the authenticated Neon user. Those app records remain browser-local.
- **Monitoring indicators:** Computed in the app from assessment and journal history; they are not medical diagnoses.

## User workflow

```mermaid
flowchart TD
    START[Open AstroMind] --> SESSION{Valid Neon session?}
    SESSION -- No --> SIGNIN[Show sign-in or create-account page]
    SIGNIN --> NEON[Neon Managed Auth checks credentials]
    NEON -->|success| LOAD
    NEON -->|failure| ERROR[Show authentication error]
    ERROR --> SIGNIN
    SESSION -- Yes --> LOAD[Load app data for the signed-in user]
    LOAD --> HOME[Open Overview]
    HOME --> MONITOR[Open Live Monitoring or Body Map]
    MONITOR --> API[API validates Neon session]
    API --> MAP[Resolve this account's astronaut ID]
    MAP --> FILTER[Fetch matching reference and live rows only]
    FILTER --> MONITOR
    HOME --> ACT{Choose an activity}
    ACT --> TEST[Complete a cognitive assessment]
    ACT --> JOURNAL[Save a health journal check-in]
    ACT --> VIEW[Review trends, alerts, and profile]
    TEST --> SAVE[Save records to this user's browser storage]
    JOURNAL --> SAVE
    SAVE --> ANALYZE[Recompute cognitive trends and monitoring indicators]
    ANALYZE --> VIEW
    VIEW --> SIGNOUT[Sign out]
    SIGNOUT --> CLEAR[End Neon session and clear in-memory user data]
    CLEAR --> START
```

## Data boundaries and current limitations

- Neon Auth owns identity and sessions. The browser never connects directly to Postgres with a database password.
- Assessment results, journal entries, preferences, and seeded demo history are currently stored in browser `localStorage`, scoped by Neon user ID. They are not yet synchronized to Neon and will not follow a user to another browser.
- Telemetry import and random account provisioning are explicit setup commands; the CSV is not transferred merely by building the UI.
- The monitoring API resolves the astronaut ID from a verified Neon session and a unique server-side mapping. It does not expose a caller-controlled astronaut filter.
- The BLE receiver syncs deferred readings every 60 seconds; the web UI polls Neon every five seconds, so updates may lag the receiver.
- All seeded readings and profile data are fictional. Monitoring indicators are informational only, not medical diagnoses.
