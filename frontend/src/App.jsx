import { useCallback, useEffect, useState } from 'react'
import { Box, CircularProgress, Container, Stack, Typography } from '@mui/material'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { deleteStudySet, fetchAuthUser, fetchMyStudySets, fetchPublicStudySets, fetchRandomPublicStudySets, login, logout, register, updateStudySetVisibility } from './api'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import BrowsePage from './pages/BrowsePage'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import CreatePage from './pages/CreatePage'
import SignInPage from './pages/SignInPage'
import RegisterPage from './pages/RegisterPage'
import StudySetPage from './pages/StudySetPage'

const GUEST_USER = { authenticated: false, id: null, username: null }

export default function App() {
  const navigate = useNavigate()
  const [authUser, setAuthUser] = useState(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [publicSets, setPublicSets] = useState([])
  const [randomPublicSets, setRandomPublicSets] = useState([])
  const [mySets, setMySets] = useState([])
  const [loadingSets, setLoadingSets] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState(null)

  const refreshDashboard = useCallback(async (user) => {
    setLoadingSets(true)
    setDashboardError('')
    try {
      const publicData = await fetchPublicStudySets()
      setPublicSets(publicData)
      if (user?.authenticated) {
        setRandomPublicSets([])
        const ownData = await fetchMyStudySets()
        setMySets(ownData)
      } else {
        const randomData = await fetchRandomPublicStudySets(3)
        setRandomPublicSets(randomData)
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
      } catch {
        if (!alive) return
        setAuthUser(GUEST_USER)
        await refreshDashboard(GUEST_USER)
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

  const handleLogin = async (values) => {
    const nextUser = await login(values)
    setAuthUser(nextUser)
    await refreshDashboard(nextUser)
    return nextUser
  }

  const handleRegister = async (values) => {
    const nextUser = await register(values)
    setAuthUser(nextUser)
    await refreshDashboard(nextUser)
    return nextUser
  }

  const handleLogout = async () => {
    await logout()
    setAuthUser(GUEST_USER)
    await refreshDashboard(GUEST_USER)
    navigate('/')
  }

  const handleDeleteStudySet = async (studySet) => {
    if (!window.confirm(`Delete "${studySet.title}"? This cannot be undone.`)) {
      return
    }

    setDeletingId(studySet.id)
    setDashboardError('')
    try {
      await deleteStudySet(studySet.id)
      await refreshDashboard(authUser)
    } catch (error) {
      setDashboardError(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStudySetVisibility = async (studySet) => {
    const nextVisibility = studySet.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
    setUpdatingVisibilityId(studySet.id)
    setDashboardError('')
    try {
      await updateStudySetVisibility(studySet.id, nextVisibility)
      await refreshDashboard(authUser)
    } catch (error) {
      setDashboardError(error.message)
    } finally {
      setUpdatingVisibilityId(null)
    }
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
      <Navbar authUser={authUser} onLogout={handleLogout} />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 }, flexGrow: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                authUser={authUser}
                loadingSets={loadingSets}
                dashboardError={dashboardError}
                publicSets={publicSets}
                randomPublicSets={randomPublicSets}
                mySets={mySets}
              />
            }
          />
          <Route
            path="/browse"
            element={
              <BrowsePage
                publicSets={publicSets}
                loadingSets={loadingSets}
                dashboardError={dashboardError}
              />
            }
          />
          <Route path="/login" element={<SignInPage authUser={authUser} onSubmit={handleLogin} />} />
          <Route path="/register" element={<RegisterPage authUser={authUser} onSubmit={handleRegister} />} />
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
              <ProtectedRoute authUser={authUser}>
                <LibraryPage
                  mySets={mySets}
                  loadingSets={loadingSets}
                  deletingId={deletingId}
                  updatingVisibilityId={updatingVisibilityId}
                  onDelete={handleDeleteStudySet}
                  onToggleVisibility={handleToggleStudySetVisibility}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/study-set/:studySetId" element={<StudySetPage authUser={authUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Box>
  )
}
