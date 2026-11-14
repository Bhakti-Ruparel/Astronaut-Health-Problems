export type AssessmentType = 'reaction' | 'memory' | 'attention'

export interface AssessmentResult {
  id: string
  type: AssessmentType
  timestamp: string
  source: 'seed' | 'user'
  score: number
  reactionMs?: number
  bestMs?: number
  prematureCount?: number
  accuracy?: number
  maxLength?: number
  completionMs?: number
  hits?: number
  misses?: number
  falseAlarms?: number
  targets?: number
  meanHitMs?: number
}

/** Result emitted by a game before the page adds id/timestamp/source. */
export type GameResult = Omit<AssessmentResult, 'id' | 'timestamp' | 'source'>

export type SymptomId =
  | 'headache'
  | 'nausea'
  | 'eyeStrain'
  | 'muscleAche'
  | 'congestion'
  | 'dizziness'
  | 'backPain'
  | 'irritability'

export interface JournalEntry {
  id: string
  date: string
  sleepHours: number
  sleepQuality: number
  fatigue: number
  stress: number
  mood: number
  symptoms: SymptomId[]
  notes: string
  source: 'seed' | 'user'
}

export interface Baseline {
  reactionMs: number
  memoryAccuracy: number
  attentionScore: number
  sleepHours: number
  fatigue: number
  stress: number
  calibratedAt: string
}

export type AlertRuleId = 'reaction-slow' | 'memory-decline' | 'sleep-decrease' | 'fatigue-rising'

export interface Preferences {
  reactionThresholdPct: number
  memoryDropPoints: number
  sleepDropHours: number
  fatigueRise: number
  alertsEnabled: Record<AlertRuleId, boolean>
  dailyReminder: boolean
  reminderTime: string
  showDemoBadges: boolean
}

export type Severity = 'info' | 'moderate' | 'high'

export interface AlertItem {
  id: AlertRuleId
  severity: Severity
  title: string
  explanation: string
  metrics: { label: string; value: string }[]
  recommendation: string
  firedAt: string
}
