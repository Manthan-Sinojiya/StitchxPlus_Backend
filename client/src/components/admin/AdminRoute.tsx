import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface AdminRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function AdminRoute({ children, allowedRoles = ['ADMIN', 'STAFF'] }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-slate-800 space-y-4 font-sans">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest font-mono">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
}
