import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser } from '../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('donor' | 'ngo')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuth = isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const user = getUser();
  const role = user?.user_metadata?.role || 'donor'; // fallback

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
