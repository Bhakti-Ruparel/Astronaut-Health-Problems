# AstroMind - NASA-inspired astronaut health monitoring interface
Build a production-quality React + TypeScript + Vite app with Tailwind CSS, React Router, Recharts, Lucide React. Modular reusable components. Persistent demo state in localStorage. Responsive desktop and tablet. Hackathon prototype: prioritize a working polished experience. No NASA logo/seal, no claim of affiliation.

## Design
Palette: mission navy #101D35 (background), space blue #172D4A (cards/panels), orange accent #FC6D26, telemetry cyan #55C6E8, space white #F4F7FA (text), muted gray-blue for supporting text. Font Inter or Space Grotesk (Google Fonts or @fontsource). Refined mission-control aesthetic: NASA Mission Control meets modern medical intelligence platform; subtle orbital/telemetry details (thin rings, tick marks, mono readouts), beautiful charts, consistent spacing, subtle transitions/micro-interactions, strong contrast, accessible controls (focus rings, aria labels, keyboard operable). Avoid excessive gradients, clutter, generic admin-dashboard look, overly decorative space backgrounds.

## Layout
Persistent sidebar (collapsible on tablet) with: Overview, Cognitive Assessment, Health Journal, Health Trends, Alerts & Insights, Mission Profile (React Router routes, active state). Top bar: AstroMind branding, current mission/expedition, mission elapsed time (clearly labeled DEMO/simulated, ticking), connection status indicator, astronaut profile chip.

## Pages
1. Mission Overview: personalized greeting; health overview; cognitive status vs personal baseline; sleep duration; self-reported fatigue; stress and mood indicators; latest assessment result; recent trends (sparklines/charts); daily assessment CTA linking to assessment; recent alerts and recommendations. Realistic, clearly labeled SIMULATED sample data.
2. Cognitive Assessment (MOST IMPORTANT, genuinely playable, not static):
 a. Reaction Time Test: wait random delay (1.5-4s), show stimulus, user clicks/presses key/space ASAP, measure ms with performance.now(), detect premature responses (show 'too soon' and restart the trial), multiple trials (5) with average/best.
 b. Memory Test: show sequence of numbers/symbols, hide it, user reproduces it via input pad, record accuracy and completion time; progressive length across a few rounds.
 c. Attention Test: stream of visual symbols one at a time (~1s each, ~30-40 items), user responds to specific targets, record hits, misses, false alarms.
 After each test show results: score, reaction time or accuracy, comparison with previous performance, comparison with personal baseline (delta and %), and plain-language explanation of what the test measures. Save results to localStorage so they appear in Trends, Overview, Alerts and Profile history immediately. Include a way to reset demo data.
3. Health Journal: daily check-in under one minute: sleep quality, sleep hours, fatigue level, stress level, mood (selectable scales/sliders, emoji or icon scales), symptom chips (headache, nausea, eye strain, muscle ache, congestion, etc.), optional notes. Save to localStorage, show saved confirmation and recent entries.
4. Health Trends: Recharts charts for reaction time over time, memory accuracy, attention performance, sleep duration, fatigue and stress. Personal baseline as reference line/band. Clearly distinguish MEASURED cognitive performance (assessments) from SELF-REPORTED data (journal) with visual labels/sections. Time-range selector (7/14/30 days). Seed ~30 days of simulated history, merged with user-generated data.
5. Alerts & Insights: monitoring indicators derived from the data by rules computed from actual data, not hardcoded: reaction time consistently slower than baseline, memory accuracy declining over multiple sessions, sleep duration decreasing over recent days, fatigue reports rising. Each has severity, plain-language explanation, supporting numbers, recommended action, dismiss/acknowledge. State everywhere relevant: 'Monitoring indicators, not medical diagnoses.' Never diagnose conditions. Seeded data should trigger a couple of alerts.
6. Mission Profile: fictional sample astronaut profile, mission details, assessment history table, personal baseline information (computed/editable baseline, e.g. recalibrate from recent sessions), monitoring preferences (toggles, alert thresholds, reminder time) persisted in localStorage.

## Data/honesty rules
All sample data is fictional and labeled 'Simulated demo data'. Do not fabricate NASA data or imply medical validation or NASA endorsement; include a short disclaimer in footer/profile.

## Code structure suggestion
src/components (Layout, Sidebar, TopBar, MetricCard, ChartCard, BaselineChart, Sparkline, StatusBadge, AlertCard, games/ReactionTest, MemoryTest, AttentionTest, ResultPanel), src/pages, src/hooks (useLocalStorage, useMissionClock), src/data (seed generator, baseline), src/lib (alert rules, stats), src/store or context for app state. Tailwind theme extended with the palette. Verify with npm run build and fix all errors. Write a short README with run instructions (npm install, npm run dev).
