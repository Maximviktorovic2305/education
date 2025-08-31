'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Book, Code, CheckCircle, Trophy } from 'lucide-react';
import { usePlatformFeatures } from '@/hooks/queries/usePlatform';
import FeatureCard from './FeatureCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const FeaturesSection = () => {
  const { data: features = [], isLoading: featuresLoading, error: featuresError, refetch: refetchFeatures } = usePlatformFeatures();

  // Fallback features in case backend is not available
  const fallbackFeatures = [
    {
      id: '1',
      icon: 'Book',
      title: '20+ уроков',
      description: 'Структурированные уроки по основам Go программирования',
    },
    {
      id: '2',
      icon: 'Code',
      title: '60+ задач',
      description: 'Практические задания разной сложности',
    },
    {
      id: '3',
      icon: 'CheckCircle',
      title: '200+ тестов',
      description: 'Проверка знаний с автоматической оценкой',
    },
    {
      id: '4',
      icon: 'Trophy',
      title: 'Сертификаты',
      description: 'Получайте сертификаты за достижения',
    },
  ];

  const getIcon = (iconName: string) => {
    const iconProps = { className: "h-8 w-8" };
    switch (iconName) {
      case 'Book': return <Book {...iconProps} />;
      case 'Code': return <Code {...iconProps} />;
      case 'CheckCircle': return <CheckCircle {...iconProps} />;
      case 'Trophy': return <Trophy {...iconProps} />;
      default: return <Book {...iconProps} />;
    }
  };

  const displayFeatures = features.length > 0 ? features : (featuresError ? fallbackFeatures : []);

  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto">
        <h3 className="text-3xl font-bold text-center mb-12">Что вас ждёт</h3>
        
        {featuresLoading && (
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        {!featuresLoading && displayFeatures.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayFeatures.map((feature) => (
              <FeatureCard 
                key={feature.id}
                icon={getIcon(feature.icon || 'Book')}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        )}
        
        {featuresError && (
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Используются локальные данные (сервер недоступен)
            </p>
            <Button variant="outline" size="sm" onClick={() => refetchFeatures()}>
              Повторить
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;