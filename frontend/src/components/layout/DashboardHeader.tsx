'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfile, useLogout } from '@/hooks/queries/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { User, LogOut } from 'lucide-react';
import Logo from '@/components/common/Logo';

const DashboardHeader = () => {
  const { data: user } = useProfile();
  const logoutMutation = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    logoutMutation.mutate();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard">
          <Logo size="md" showText={false} />
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{user?.name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;