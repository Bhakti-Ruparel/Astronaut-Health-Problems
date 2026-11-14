# AstroMind

NASA-inspired astronaut health monitoring interface (hackathon prototype). All data is fictional, simulated demo data. Not affiliated with or endorsed by NASA. Alerts are monitoring indicators, not medical diagnoses.

## Run
```
npm install
npm run dev
```
Build: `npm run build`. Preview the build: `npm run preview`.

## Deploy to Vercel
1. Push this repository to GitHub and import it into [Vercel](https://vercel.com/new).
2. Keep the detected Vite settings: build command `npm run build` and output directory `dist`.
3. Select **Deploy**. The `vercel.json` rewrite keeps React Router routes working when opened directly or refreshed.

## Routes
`/` Overview, `/assessment` (supports `?test=reaction|memory|attention`), `/journal`, `/trends`, `/alerts`, `/profile`.

## Features
- Playable Reaction Time (5 trials, premature-click detection), Memory (5 rounds, sequences of 4-8 digits) and Attention (36 symbols, target is the triangle) tests with result panels comparing to the previous run and the personal baseline.
- Health Journal: sleep, sleep quality, fatigue, stress, mood, symptoms, notes. One entry per day; saving again overwrites.
- Health Trends: measured cognitive performance and self-reported data are shown in separate sections, with baseline lines and bands.
- Alerts & Insights: computed from the data (slower reaction, declining memory, decreasing sleep, rising fatigue) with explanations and recommended actions.
- Mission Profile: fictional profile, mission, baseline, history, monitoring preferences, and "Reset demo data".

## Data and baseline
A 30-day seeded history (deterministic PRNG) is generated on first load and stored in localStorage under `astromind:v1`. The baseline is the mean of the first 14 seeded days and can be recalibrated from the last 7 days on the Profile page.

## Scoring
- Reaction score = clamp(round(100 * (600 - avgMs) / 400), 0, 100)
- Memory score = round(0.7 * accuracy + 0.3 * min(100, maxLength / 8 * 100))
- Attention score = clamp(round(100 * hits / targets - 15 * falseAlarms), 0, 100)

## Reset
Use "Reset demo data" on the Mission Profile page, or clear the `astromind:v1` key in localStorage.
