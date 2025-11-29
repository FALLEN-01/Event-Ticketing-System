import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  // Check if user is authenticated
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')

  if (!token || !user) {
    // Not authenticated, redirect to login
    return <Navigate to="/auth" replace />
  }

  // Authenticated, render the protected component
  return children
}

export default ProtectedRoute
