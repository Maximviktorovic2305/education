'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardHeader from '@/components/layout/DashboardHeader';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import StatsGrid from '@/components/dashboard/StatsGrid';
import QuickActionsGrid from '@/components/dashboard/QuickActionsGrid';
import LoadingPage from '@/components/common/LoadingPage';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
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