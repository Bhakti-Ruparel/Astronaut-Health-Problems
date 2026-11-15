import { lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AuthPage } from './pages/AuthPage'
import { AppProvider } from './store/AppStore'
import { useAuth } from './store/AuthStore'

const OverviewPage = lazy(() => import('./pages/OverviewPage').then((m) => ({ default: m.OverviewPage })))
const AssessmentPage = lazy(() => import('./pages/AssessmentPage').then((m) => ({ default: m.AssessmentPage })))
const JournalPage = lazy(() => import('./pages/JournalPage').then((m) => ({ default: m.JournalPage })))
const TrendsPage = lazy(() => import('./pages/TrendsPage').then((m) => ({ default: m.TrendsPage })))
const AlertsPage = lazy(() => import('./pages/AlertsPage').then((m) => ({ default: m.AlertsPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const MonitoringPage = lazy(() => import('./pages/MonitoringPage').then((m) => ({ default: m.MonitoringPage })))
const BodyMapPage = lazy(() => import('./pages/BodyMapPage').then((m) => ({ default: m.BodyMapPage })))

export default function App() {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center" role="status">
        <span className="pulse-dot mr-3 h-2.5 w-2.5 rounded-full bg-cyan" aria-hidden="true" />
        Restoring Neon session…
      </main>
    )
  }

  if (status === 'unconfigured') return <AuthPage />
  if (!user && location.pathname !== '/auth') {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }
  if (!user) return <AuthPage />
  if (location.pathname === '/auth') return <Navigate to="/" replace />

  return (
    <AppProvider key={user.id} userId={user.id}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<OverviewPage />} />
          <Route path="assessment" element={<AssessmentPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="trends" element={<TrendsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="body-map" element={<BodyMapPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
