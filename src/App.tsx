import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AlertsPage } from './pages/AlertsPage'
import { AssessmentPage } from './pages/AssessmentPage'
import { JournalPage } from './pages/JournalPage'
import { OverviewPage } from './pages/OverviewPage'
import { ProfilePage } from './pages/ProfilePage'
import { TrendsPage } from './pages/TrendsPage'

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
