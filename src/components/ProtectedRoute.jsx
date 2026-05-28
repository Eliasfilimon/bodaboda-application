import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * ProtectedRoute - Redirects to login if not authenticated.
 * @param {string} requiredType - 'user' | 'rider' | undefined (any authenticated)
 */
export const ProtectedRoute = ({ children, requiredType }) => {
  const { isAuthenticated, userType, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = requiredType === 'rider' ? '/rider-login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (requiredType && userType !== requiredType) {
    // Rider trying to access user-only page or vice versa
    return <Navigate to="/" replace />;
  }

  return children;
};
