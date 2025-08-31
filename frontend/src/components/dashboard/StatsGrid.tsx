'use client';

import { useProfile } from '@/hooks/queries/useAuth';
import { useCurrentUserStats } from '@/hooks/queries/useProgress';
import { Trophy, User, Book, Code } from 'lucide-react';
import StatsCard from './StatsCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const StatsGrid = () => {
  const { data: user } = useProfile();
  const { data: stats, isLoading: statsLoading, error: statsError } = useCurrentUserStats();

  // Use backend data if available, fallback to user auth data
  const displayStats = [
    {
      icon: <Trophy className="h-6 w-6 text-primary" />,
      value: stats?.points ?? user?.points ?? 0,
      label: 'Баллы',
      iconColor: 'bg-primary/10'
    },
    {
      icon: <User className="h-6 w-6 text-blue-500" />,
      value: (stats?.level ?? user?.level ?? 'junior').charAt(0).toUpperCase() + (stats?.level ?? user?.level ?? 'junior').slice(1),
      label: 'Уровень',
      iconColor: 'bg-blue-500/10'
    },
    {
      icon: <Book className="h-6 w-6 text-green-500" />,
      value: stats?.lessonsCompleted ?? 0,
      label: 'Пройдено уроков',
      iconColor: 'bg-green-500/10'
    },
    {
      icon: <Code className="h-6 w-6 text-purple-500" />,
      value: stats?.problemsSolved ?? 0,
      label: 'Решено задач',
      iconColor: 'bg-purple-500/10'
    }
  ];

  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex justify-center items-center h-24">
            <LoadingSpinner size="md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <StatsCard 
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            iconColor={stat.iconColor}
          />
        ))}
      </div>
      {statsError && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          Используются локальные данные (сервер недоступен)
        </p>
      )}
    </div>
  );
};

export default StatsGrid;