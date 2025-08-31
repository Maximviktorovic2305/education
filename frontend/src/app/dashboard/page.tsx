'use client';

import { useProfile } from '@/hooks/queries/useAuth';
import DashboardHeader from '@/components/layout/DashboardHeader';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import StatsGrid from '@/components/dashboard/StatsGrid';
import QuickActionsGrid from '@/components/dashboard/QuickActionsGrid';
import LoadingPage from '@/components/common/LoadingPage';
import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/queryClient';

export default function DashboardPage() {
  // Check authentication
  const isAuthenticated = !!getAccessToken();
  
  if (!isAuthenticated) {
    redirect('/auth/login');
  }

  const { data: user, isLoading } = useProfile();

  if (isLoading || !user) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <WelcomeSection />
        <StatsGrid />
        <QuickActionsGrid />
      </div>
    </div>
  );
}