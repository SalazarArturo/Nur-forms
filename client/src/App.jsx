import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import CampaignsPage from './pages/campaigns/CampaignsPage'
import CampaignDetailPage from './pages/campaigns/CampaignDetailPage'
import FormBuilderPage from './pages/builder/FormBuilderPage'
import RespondPage from './pages/respond/RespondPage'
import ReportsPage from './pages/reports/ReportsPage'
import UsersPage from './pages/users/UsersPage'
import { Loading } from './components/ui'

function PrivateRoute({ children, roles }) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  const { token, fetchMe, user } = useAuthStore()

  useEffect(() => {
    if (token && !user) fetchMe()
  }, [token, user, fetchMe])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/respond/:formId" element={<RespondPage />} />
        <Route path="/" element={<PrivateRoute roles={['admin','creator']}><DashboardPage /></PrivateRoute>} />
        <Route path="/campaigns" element={<PrivateRoute roles={['admin','creator']}><CampaignsPage /></PrivateRoute>} />
        <Route path="/campaigns/:id" element={<PrivateRoute roles={['admin','creator']}><CampaignDetailPage /></PrivateRoute>} />
        <Route path="/campaigns/:campaignId/forms/:formId/edit" element={<PrivateRoute roles={['admin','creator']}><FormBuilderPage /></PrivateRoute>} />
        <Route path="/forms/:formId/reports" element={<PrivateRoute roles={['admin','creator']}><ReportsPage /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute roles={['admin']}><UsersPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
