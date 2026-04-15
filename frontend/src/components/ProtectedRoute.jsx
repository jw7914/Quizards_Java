import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ authUser, children }) {
  const location = useLocation()
  if (!authUser?.authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}
