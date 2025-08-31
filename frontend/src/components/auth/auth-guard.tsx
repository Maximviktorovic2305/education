'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/queries/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  redirectTo = '/auth/login' 
}) => {
  const { data: user, isLoading, error } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || error)) {
      router.push(redirectTo);
      return;
    }
  }, [user, isLoading, error, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect
  if (!user || error) {
    return null; // Will be redirected by useEffect
  }

  return <>{children}</>;
};

interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { data: user, isLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo);
      return;
    }
  }, [user, isLoading, router, redirectTo]);

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect
  if (user) {
    return null; // Will be redirected by useEffect
  }

  return <>{children}</>;
};