import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'

const OverviewPage = lazy(() => import('./pages/OverviewPage').then((m) => ({ default: m.OverviewPage })))
const AssessmentPage = lazy(() => import('./pages/AssessmentPage').then((m) => ({ default: m.AssessmentPage })))
const JournalPage = lazy(() => import('./pages/JournalPage').then((m) => ({ default: m.JournalPage })))
const TrendsPage = lazy(() => import('./pages/TrendsPage').then((m) => ({ default: m.TrendsPage })))
const AlertsPage = lazy(() => import('./pages/AlertsPage').then((m) => ({ default: m.AlertsPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<OverviewPage />} />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="trends" element={<TrendsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
