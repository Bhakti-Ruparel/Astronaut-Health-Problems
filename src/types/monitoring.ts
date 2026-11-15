export type AnomalyStatus = 'NORMAL' | 'ANOMALY' | 'UNKNOWN'

export interface AnomalousFeature {
  feature: string
  value: number
  status: 'LOW' | 'HIGH'
  severity: string
}

export interface TelemetryReading {
  stream_type: 'live' | 'reference'
  astronaut_id: string
  recorded_at: string
  source: string
  heart_rate_bpm: number
  spo2_percent: number
  systolic_bp: number
  diastolic_bp: number
  body_temperature_c: number
  respiratory_rate: number
  ecg_heart_rate_bpm: number
  activity_level: number
  sleep_hours: number
  body_weight_kg: number
  radiation_exposure_msv: number
  anomaly_pred: number | null
  anomaly_score: number | null
  overall_status: AnomalyStatus
  anomalous_features: AnomalousFeature[]
}

export interface MonitoringSnapshot {
  astronautId: string
  readings: TelemetryReading[]
  isLive: boolean
  liveStaleAfterSeconds: number
}
