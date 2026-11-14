import { Brain, Crosshair, Timer, type LucideIcon } from 'lucide-react'
import type { PlanetVariant } from '../art/Planet'
import { ACCENTS, type Accent } from '../../lib/theme'
import type { AssessmentType } from '../../types'

export interface MissionInfo {
  type: AssessmentType
  title: string
  mission: string
  icon: LucideIcon
  planet: PlanetVariant
  accent: Accent
  duration: string
  desc: string
  measures: string
  steps: [string, string, string]
  controls: string
}

export const MISSIONS: MissionInfo[] = [
  {
    type: 'reaction',
    title: 'Reaction Time Test',
    mission: 'Signal Strike',
    icon: Timer,
    planet: 'gas',
    accent: ACCENTS.reaction,
    duration: '~1 min',
    desc: 'Wait for the beacon to ignite, then react as fast as you can. Five trials.',
    measures: 'Processing speed and alertness',
    steps: [
      'Keep your eyes on the beacon. It stays dark while you wait.',
      'When it ignites green and says TAP NOW, click it or press Space as fast as you can.',
      'Tapping early restarts that trial. You complete five trials.',
    ],
    controls: 'Click the arena, or press Space or Enter.',
  },
  {
    type: 'memory',
    title: 'Memory Test',
    mission: 'Star Map',
    icon: Brain,
    planet: 'nebula',
    accent: ACCENTS.memory,
    duration: '~2 min',
    desc: 'Watch a digit sequence, then type it from memory. Five rounds, 4 to 8 digits.',
    measures: 'Working memory',
    steps: [
      'Digits light up one at a time. Memorize their order.',
      'When the slots appear, enter the sequence with the on-screen pad or your keyboard.',
      'Five rounds, from 4 digits up to 8.',
    ],
    controls: 'Number keys 0-9 to enter, Backspace to delete.',
  },
  {
    type: 'attention',
    title: 'Attention Test',
    mission: 'Deep Scan',
    icon: Crosshair,
    planet: 'ringed',
    accent: ACCENTS.attention,
    duration: '~40 s',
    desc: 'Respond only to the triangle target in a stream of 36 symbols.',
    measures: 'Sustained attention and impulse control',
    steps: [
      'Symbols flash one at a time inside the scanner ring.',
      'Respond only when you see the triangle \u25B2. Ignore every other symbol.',
      'There are 36 symbols. Wrong responses count as false alarms.',
    ],
    controls: 'Press Space or use the large respond button.',
  },
]

export const missionFor = (type: AssessmentType): MissionInfo => MISSIONS.find((m) => m.type === type)!
