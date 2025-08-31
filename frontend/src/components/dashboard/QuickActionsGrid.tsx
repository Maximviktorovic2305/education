'use client';

import { useRouter } from 'next/navigation';
import { Book, Code, Trophy, Settings } from 'lucide-react';
import ActionCard from './ActionCard';

const QuickActionsGrid = () => {
  const router = useRouter();

  const actions = [
    {
      icon: <Book className="h-6 w-6 text-primary" />,
      title: 'Курсы',
      description: 'Изучайте Go с нуля до профессионала',
      buttonText: 'Начать обучение',
      buttonVariant: 'default' as const,
      iconColor: 'bg-primary/10',
      onClick: () => router.push('/courses')
    },
    {
      icon: <Code className="h-6 w-6 text-green-500" />,
      title: 'Практика',
      description: 'Решайте задачи и улучшайте навыки',
      buttonText: 'Решать задачи',
      buttonVariant: 'outline' as const,
      iconColor: 'bg-green-500/10',
      onClick: () => router.push('/practice')
    },
    {
      icon: <Trophy className="h-6 w-6 text-emerald-500" />,
      title: 'Прогресс',
      description: 'Отслеживайте свои достижения',
      buttonText: 'Посмотреть прогресс',
      buttonVariant: 'outline' as const,
      iconColor: 'bg-emerald-500/10',
      onClick: () => router.push('/progress')
    },
    {
      icon: <Trophy className="h-6 w-6 text-blue-500" />,
      title: 'Тестирование',
      description: 'Проверьте свои знания Go',
      buttonText: 'Пройти тесты',
      buttonVariant: 'outline' as const,
      iconColor: 'bg-blue-500/10',
      onClick: () => router.push('/tests')
    },
    {
      icon: <Trophy className="h-6 w-6 text-indigo-500" />,
      title: 'Сертификаты',
      description: 'Получайте сертификаты за достижения',
      buttonText: 'Мои сертификаты',
      buttonVariant: 'outline' as const,
      iconColor: 'bg-indigo-500/10',
      onClick: () => router.push('/certificates')
    },
    {
      icon: <Settings className="h-6 w-6 text-purple-500" />,
      title: 'Профиль',
      description: 'Управляйте своим аккаунтом',
      buttonText: 'Настройки',
      buttonVariant: 'outline' as const,
      iconColor: 'bg-purple-500/10',
      onClick: () => router.push('/profile')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {actions.map((action, index) => (
        <ActionCard 
          key={index}
          icon={action.icon}
          title={action.title}
          description={action.description}
          buttonText={action.buttonText}
          buttonVariant={action.buttonVariant}
          iconColor={action.iconColor}
          onClick={action.onClick}
        />
      ))}
    </div>
  );
};

export default QuickActionsGrid;