import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = ({ children, requiredType }) => {
  const { isAuthenticated, userType, user, loading } = useAuth();
  const location = useLocation();

  // Wait for localStorage restore before making redirect decisions
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-twende-gray-light">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = requiredType === 'rider' ? '/rider-login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Admin-only route
  if (requiredType === 'admin') {
    if (user?.role !== 'admin') {
      // Redirect to the correct dashboard instead of /
      const fallback = userType === 'rider' ? '/dashboard' : '/passenger-dashboard';
      return <Navigate to={fallback} replace />;
    }
    return children;
  }

  // Role mismatch — send to the right home
  if (requiredType && userType !== requiredType) {
    const redirect =
      userType === 'rider' ? '/dashboard' :
      user?.role === 'admin' ? '/admin' :
      '/passenger-dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
};
