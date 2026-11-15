import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_PREFERENCES, generateSeed } from '../data/seed'
import { computeAlerts } from '../lib/alerts'
import { computeBaseline } from '../lib/baseline'
import { cutoffKey, dateKey } from '../lib/stats'
import { readStorage } from '../hooks/useLocalStorage'
import type {
  AlertItem,
  AlertRuleId,
  AssessmentResult,
  Baseline,
  JournalEntry,
  Preferences,
} from '../types'

const KEY_PREFIX = 'astromind:v1:'

interface PersistedState {
  assessments: AssessmentResult[]
  journal: JournalEntry[]
  baseline: Baseline
  preferences: Preferences
  /** Rule id -> firedAt value when it was acknowledged. */
  dismissed: Partial<Record<AlertRuleId, string>>
}

function freshState(): PersistedState {
  const seed = generateSeed(new Date())
  return { ...seed, preferences: DEFAULT_PREFERENCES, dismissed: {} }
}

function loadState(key: string): PersistedState {
  const saved = readStorage<PersistedState>(key)
  if (
    saved &&
    Array.isArray(saved.assessments) &&
    Array.isArray(saved.journal) &&
    saved.baseline &&
    saved.preferences
  ) {
    return {
      ...saved,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...saved.preferences,
        alertsEnabled: { ...DEFAULT_PREFERENCES.alertsEnabled, ...saved.preferences.alertsEnabled },
      },
      dismissed: saved.dismissed ?? {},
    }
  }
  return freshState()
}

interface AppContextValue extends PersistedState {
  alerts: AlertItem[]
  dismissedAlerts: AlertItem[]
  addAssessment: (r: Omit<AssessmentResult, 'id' | 'timestamp' | 'source'>) => AssessmentResult
  saveJournalEntry: (e: Omit<JournalEntry, 'id' | 'source' | 'date'>) => void
  recalibrateBaseline: () => void
  updatePreferences: (p: Partial<Preferences>) => void
  dismissAlert: (id: AlertRuleId) => void
  restoreAlert: (id: AlertRuleId) => void
  resetDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const storageKey = `${KEY_PREFIX}${encodeURIComponent(userId)}`
  const [state, setState] = useState<PersistedState>(() => loadState(storageKey))

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      /* ignore storage failures */
    }
  }, [state, storageKey])

  const allAlerts = useMemo(
    () => computeAlerts(state.assessments, state.journal, state.baseline, state.preferences),
    [state.assessments, state.journal, state.baseline, state.preferences],
  )

  // A dismissal only holds while the same condition is active; drop it once the rule stops firing.
  useEffect(() => {
    const active = new Set(allAlerts.map((a) => a.id))
    const stale = (Object.keys(state.dismissed) as AlertRuleId[]).filter((id) => !active.has(id))
    if (stale.length) {
      setState((s) => {
        const next = { ...s.dismissed }
        stale.forEach((id) => delete next[id])
        return { ...s, dismissed: next }
      })
    }
  }, [allAlerts, state.dismissed])

  // Re-show a dismissed alert when new data has been recorded since it was acknowledged.
  const alerts = useMemo(
    () => allAlerts.filter((a) => state.dismissed[a.id] !== a.firedAt),
    [allAlerts, state.dismissed],
  )
  const dismissedAlerts = useMemo(
    () => allAlerts.filter((a) => state.dismissed[a.id] === a.firedAt),
    [allAlerts, state.dismissed],
  )

  const addAssessment = useCallback<AppContextValue['addAssessment']>((r) => {
    const full: AssessmentResult = {
      ...r,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: 'user',
    }
    setState((s) => ({ ...s, assessments: [...s.assessments, full] }))
    return full
  }, [])

  const saveJournalEntry = useCallback<AppContextValue['saveJournalEntry']>((e) => {
    const date = dateKey(new Date())
    setState((s) => {
      const existing = s.journal.find((j) => j.date === date)
      const entry: JournalEntry = {
        ...e,
        date,
        id: existing?.id ?? crypto.randomUUID(),
        source: 'user',
      }
      return { ...s, journal: [...s.journal.filter((j) => j.date !== date), entry] }
    })
  }, [])

  const recalibrateBaseline = useCallback(() => {
    setState((s) => {
      const from = cutoffKey(7)
      const to = dateKey(new Date())
      return { ...s, baseline: computeBaseline(s.assessments, s.journal, from, to, s.baseline) }
    })
  }, [])

  const updatePreferences = useCallback((p: Partial<Preferences>) => {
    setState((s) => ({ ...s, preferences: { ...s.preferences, ...p } }))
  }, [])

  const dismissAlert = useCallback(
    (id: AlertRuleId) => {
      const alert = allAlerts.find((a) => a.id === id)
      if (!alert) return
      setState((s) => ({ ...s, dismissed: { ...s.dismissed, [id]: alert.firedAt } }))
    },
    [allAlerts],
  )

  const restoreAlert = useCallback((id: AlertRuleId) => {
    setState((s) => {
      const next = { ...s.dismissed }
      delete next[id]
      return { ...s, dismissed: next }
    })
  }, [])

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      /* ignore */
    }
    setState(freshState())
  }, [storageKey])

  const value: AppContextValue = {
    ...state,
    alerts,
    dismissedAlerts,
    addAssessment,
    saveJournalEntry,
    recalibrateBaseline,
    updatePreferences,
    dismissAlert,
    restoreAlert,
    resetDemo,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
