'use client';

import { useAuthStore } from '@/store/auth';

const WelcomeSection = () => {
  const { user } = useAuthStore();

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-2">
        Добро пожаловать, {user?.name}!
      </h2>
      <p className="text-muted-foreground">
        Продолжите изучение Go или начните новые вызовы
      </p>
    </div>
  );
};

export default WelcomeSection;