import {
  Activity,
  Annoyed,
  BellRing,
  Brain,
  Eye,
  Frown,
  Laugh,
  LayoutDashboard,
  Meh,
  NotebookPen,
  Smile,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import type { SymptomId } from '../types'

export const NAV_ITEMS: {
  path: string
  label: string
  short: string
  icon: LucideIcon
  mobile: 'tab' | 'more'
  end?: boolean
}[] = [
  { path: '/', label: 'Home', short: 'Home', icon: LayoutDashboard, mobile: 'tab', end: true },
  { path: '/assessment', label: 'Assessments', short: 'Tests', icon: Brain, mobile: 'tab' },
  { path: '/journal', label: 'Health Journal', short: 'Journal', icon: NotebookPen, mobile: 'more' },
  { path: '/trends', label: 'Health Trends', short: 'Trends', icon: TrendingUp, mobile: 'tab' },
  { path: '/alerts', label: 'Alerts', short: 'Alerts', icon: BellRing, mobile: 'tab' },
  { path: '/profile', label: 'Profile', short: 'Profile', icon: UserRound, mobile: 'more' },
]

export const SYMPTOMS: { id: SymptomId; label: string; icon: LucideIcon }[] = [
  { id: 'headache', label: 'Headache', icon: Brain },
  { id: 'nausea', label: 'Nausea', icon: Activity },
  { id: 'eyeStrain', label: 'Eye strain', icon: Eye },
  { id: 'muscleAche', label: 'Muscle ache', icon: Activity },
  { id: 'congestion', label: 'Congestion', icon: Activity },
  { id: 'dizziness', label: 'Dizziness', icon: Activity },
  { id: 'backPain', label: 'Back pain', icon: Activity },
  { id: 'irritability', label: 'Irritability', icon: Annoyed },
]

export const MOOD_SCALE: { value: number; label: string; icon: LucideIcon }[] = [
  { value: 1, label: 'Very low', icon: Frown },
  { value: 2, label: 'Low', icon: Annoyed },
  { value: 3, label: 'Neutral', icon: Meh },
  { value: 4, label: 'Good', icon: Smile },
  { value: 5, label: 'Great', icon: Laugh },
]

export const MISSION = {
  name: 'Expedition Meridian-7',
  tag: 'fictional',
  station: 'Orbital Habitat Kestrel (fictional)',
  launchDate: '2025-01-14 (fictional)',
  crew: '4 crew members (fictional)',
  orbit: 'Low Earth orbit, ~92 min per revolution (illustrative)',
  metStart: { days: 142, hours: 6, minutes: 12, seconds: 0 },
}

export const ASTRONAUT = {
  name: 'Cmdr. Elena Marlowe',
  firstName: 'Elena',
  role: 'Mission Specialist',
  initials: 'EM',
  age: 41,
  heightCm: 172,
  weightKg: 63,
  specialty: 'Life sciences and robotics',
}

export const DISCLAIMER =
  'Fictional, simulated demo data. Not affiliated with or endorsed by NASA. Monitoring indicators, not medical diagnoses.'
