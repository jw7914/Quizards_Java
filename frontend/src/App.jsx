import { useCallback, useEffect, useState } from 'react'
import { Box, CircularProgress, Container, Stack, Typography } from '@mui/material'
import { Navigate, Route, Routes } from 'react-router-dom'
import { fetchAuthUser, fetchMyStudySets, fetchPublicStudySets, login, logout, register } from './api'

import TopBar from './components/TopBar'
import AuthDialog from './components/AuthDialog'
import ProtectedRoute from './components/ProtectedRoute'
import OverviewPage from './pages/OverviewPage'
import LibraryPage from './pages/LibraryPage'
import CreatePage from './pages/CreatePage'
import StudySetPage from './pages/StudySetPage'

export default function App() {
  const [authUser, setAuthUser] = useState(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [publicSets, setPublicSets] = useState([])
  const [mySets, setMySets] = useState([])
  const [loadingSets, setLoadingSets] = useState(true)
  const [dashboardError, setDashboardError] = useState('')

  const refreshDashboard = useCallback(async (user) => {
    setLoadingSets(true)
    setDashboardError('')
    try {
      const publicData = await fetchPublicStudySets()
      setPublicSets(publicData)
      if (user?.authenticated) {
        const ownData = await fetchMyStudySets()
        setMySets(ownData)
      } else {
        setMySets([])
      }
    } catch (error) {
      setDashboardError(error.message)
    } finally {
      setLoadingSets(false)
    }
  }, [])

  useEffect(() => {
    let alive = true

    async function bootstrap() {
      try {
        const user = await fetchAuthUser()
        if (!alive) return
        setAuthUser(user)
        await refreshDashboard(user)
      } catch (error) {
        if (!alive) return
        setDashboardError(error.message)
      } finally {
        if (alive) {
          setAuthResolved(true)
        }
      }
    }

    bootstrap()

    return () => {
      alive = false
    }
  }, [refreshDashboard])

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode)
    setAuthError('')
    setAuthDialogOpen(true)
  }

  const handleAuthSubmit = async (values) => {
    setAuthSubmitting(true)
    setAuthError('')
    try {
      const action = authMode === 'login' ? login : register
      const nextUser = await action(values)
      setAuthUser(nextUser)
      setAuthDialogOpen(false)
      await refreshDashboard(nextUser)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setAuthUser({ authenticated: false, id: null, username: null })
    await refreshDashboard({ authenticated: false, id: null, username: null })
  }

  if (!authResolved) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
        <Stack spacing={3} alignItems="center">
          <CircularProgress color="primary" />
          <Typography color="text.secondary">
            Loading Quizards Workspace...
          </Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar authUser={authUser} onLogin={handleOpenAuth} onLogout={handleLogout} />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 }, flexGrow: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <OverviewPage
                authUser={authUser}
                loadingSets={loadingSets}
                dashboardError={dashboardError}
                publicSets={publicSets}
                mySets={mySets}
                onLogin={() => handleOpenAuth('login')}
              />
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute authUser={authUser}>
                <CreatePage authUser={authUser} onCreated={refreshDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <LibraryPage
                authUser={authUser}
                loadingSets={loadingSets}
                publicSets={publicSets}
                mySets={mySets}
                onLogin={() => handleOpenAuth('login')}
              />
            }
          />
          <Route path="/study-set/:studySetId" element={<StudySetPage authUser={authUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      <AuthDialog
        key={authMode}
        open={authDialogOpen}
        mode={authMode}
        error={authError}
        submitting={authSubmitting}
        onClose={() => setAuthDialogOpen(false)}
        onSwitchMode={setAuthMode}
        onSubmit={handleAuthSubmit}
      />
    </Box>
  )
}
