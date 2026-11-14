import { clamp } from './stats'

/** 200 ms = 100, 600 ms = 0. */
export const reactionScore = (avgMs: number) => clamp(Math.round((100 * (600 - avgMs)) / 400), 0, 100)

/** 70% per-position accuracy + 30% longest sequence reached (8 digits = full marks). */
export const memoryScore = (accuracy: number, maxLength: number) =>
  Math.round(0.7 * accuracy + 0.3 * Math.min(100, (maxLength / 8) * 100))

/** Hit rate (0-100) minus 15 points per false alarm. */
export const attentionScore = (hits: number, targets: number, falseAlarms: number) =>
  clamp(Math.round(100 * (targets ? hits / targets : 0) - 15 * falseAlarms), 0, 100)
