export type Accent = { main: string; soft: string; glow: string }

export type ModuleId = 'cognitive' | 'reaction' | 'memory' | 'attention' | 'sleep' | 'fatigue' | 'stress'

export const ACCENTS: Record<ModuleId, Accent> = {
  cognitive: { main: '#7de3ff', soft: '#bff3ff', glow: 'rgb(125 227 255 / 0.45)' },
  reaction: { main: '#38bdf8', soft: '#9ddcfb', glow: 'rgb(56 189 248 / 0.45)' },
  memory: { main: '#a78bfa', soft: '#d3c6ff', glow: 'rgb(167 139 250 / 0.45)' },
  attention: { main: '#f472b6', soft: '#fbb6d7', glow: 'rgb(244 114 182 / 0.45)' },
  sleep: { main: '#818cf8', soft: '#c1c6fc', glow: 'rgb(129 140 248 / 0.45)' },
  fatigue: { main: '#fc6d26', soft: '#fdb08a', glow: 'rgb(252 109 38 / 0.45)' },
  stress: { main: '#34d399', soft: '#99ecc8', glow: 'rgb(52 211 153 / 0.45)' },
}
