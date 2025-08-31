'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { ProgressOverview } from '@/components/progress/progress-overview';
import { ProgressStats } from '@/components/progress/progress-stats';
import { useProfile, useLogout } from '@/hooks/queries/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, LogOut, TrendingUp, BarChart3, Award } from 'lucide-react';
import Link from 'next/link';

export default function ProgressPage() {
  const { data: user } = useProfile();
  const { mutate: logout } = useLogout();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Link>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">Прогресс обучения</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Ваш прогресс, {user?.name}!
            </h2>
            <p className="text-muted-foreground">
              Отслеживайте свои достижения и развитие навыков программирования на Go
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Обзор
              </TabsTrigger>
              <TabsTrigger value="detailed" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Детальная статистика
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <ProgressOverview showDetailed={true} />
            </TabsContent>

            <TabsContent value="detailed" className="space-y-8">
              <ProgressStats detailed={true} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}