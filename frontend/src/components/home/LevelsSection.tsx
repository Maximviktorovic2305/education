'use client';

import { useEffect } from 'react';
import { usePlatformStore } from '@/store/platform';
import LevelCard from './LevelCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const LevelsSection = () => {
  const { levels, levelsLoading, levelsError, fetchLevels } = usePlatformStore();

  useEffect(() => {
    if (levels.length === 0 && !levelsLoading) {
      fetchLevels();
    }
  }, [levels.length, levelsLoading, fetchLevels]);

  // Fallback levels in case backend is not available
  const fallbackLevels = [
    { id: '1', name: 'Junior', points: 100, color: 'text-green-500' },
    { id: '2', name: 'Middle', points: 300, color: 'text-blue-500' },
    { id: '3', name: 'Senior', points: 600, color: 'text-purple-500' },
  ];

  const displayLevels = levels.length > 0 ? levels : (levelsError ? fallbackLevels : []);

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <h3 className="text-3xl font-bold text-center mb-12">Система уровней</h3>
        
        {levelsLoading && (
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        {!levelsLoading && displayLevels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {displayLevels.map((level) => (
              <LevelCard 
                key={level.id}
                name={level.name}
                points={level.points}
                color={level.color}
              />
            ))}
          </div>
        )}
        
        {levelsError && (
          <p className="text-center text-muted-foreground">
            Используются локальные данные (сервер недоступен)
          </p>
        )}
      </div>
    </section>
  );
};

export default LevelsSection;