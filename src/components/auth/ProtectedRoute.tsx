import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresPremium?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiresPremium }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse-glow mx-auto mb-4">
            <span className="text-3xl">💝</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiresPremium && !user.isPremium) {
    return <Navigate to="/paywall" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
