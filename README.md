# AstroMind

AstroMind is a NASA-inspired astronaut health and cognitive-wellness monitoring
prototype. It combines model-scored telemetry with cognitive assessments and
self-reported wellness data in an astronaut-focused web interface. The demo
opens without sign-in or evaluator credentials.

All data is fictional or simulated. AstroMind is not affiliated with or
endorsed by NASA, and its monitoring indicators are not medical diagnoses.

## Project features

- **Public demo:** Monitoring defaults to astronaut `C001`; its historical
  records and app data are demo content.
- **Telemetry monitoring:** View imported readings, vital-sign summaries,
  anomaly scores, model classifications, flagged features, and recent records.
- **Interactive body map:** Explore body-region summaries based on the latest
  available telemetry and its anomaly indicators.
- **Cognitive assessments:** Reaction-time, memory, and attention exercises
  with personal history and baseline comparisons.
- **Health journal:** Record sleep, fatigue, stress, mood, symptoms, and notes.
- **Trends and alerts:** Review assessment and wellness trends with explanatory
  monitoring insights.
- **Mission profile:** View the demo profile, monitoring preferences, history,
  and baseline information.

## Architecture and data

- **Frontend:** React, TypeScript, and Vite provide the dashboard, assessment,
  journal, trends, monitoring, and body-map pages.
- **API:** A Node.js service proxies monitoring requests to a Python API.
  The Python API queries Neon using a server-only Postgres connection.
- **Reference telemetry:** The Neon `astro_reference_telemetry` table contains
  7,200 imported records across five astronaut IDs. The records are analyzed
  with the project's trained anomaly model.
- **Live telemetry:** New device readings are stored separately in Neon
  `health_telemetry`. The web interface polls the API every five seconds, but
  readings only change when an external telemetry producer writes new data.
- **App records:** Cognitive assessment results, journal entries, and
  preferences are stored in browser local storage on that browser. They are
  not synchronized between devices.

## Monitoring limitations

The web app does not generate live sensor readings. Without an active producer,
the monitoring pages show the imported historical records and do not update
with new telemetry. Cloud updates can also lag behind a producer's sync
interval.

Model scores, anomaly indicators, seeded histories, and profiles are for
demonstration only. They are not clinically validated.
