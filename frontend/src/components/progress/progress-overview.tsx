'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Book, 
  Code, 
  Clock, 
  Award,
  TrendingUp,
  Flame,
  Star,
  CheckCircle2
} from 'lucide-react';
import { useCurrentUserStats, useLevelSystem, useLearningStreak, useAchievements } from '@/hooks/queries/useProgress';

interface ProgressOverviewProps {
  showDetailed?: boolean;
  compact?: boolean;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  showDetailed = true,
  compact = false,
}) => {
  const { data: userStats, isLoading: statsLoading, error: statsError } = useCurrentUserStats();
  const { data: levelSystem } = useLevelSystem();
  const { data: learningStreak } = useLearningStreak();
  const { data: achievements } = useAchievements();
  
  const isLoading = statsLoading;
  const error = statsError;
  
  // Helper functions
  const getLevelName = (level: string) => {
    switch (level) {
      case 'junior': return 'Junior Разработчик';
      case 'middle': return 'Middle Разработчик';
      case 'senior': return 'Senior Разработчик';
      default: return 'Разработчик';
    }
  };
  
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'junior': return '🎓';
      case 'middle': return '📘';
      case 'senior': return '👨‍💻';
      default: return '👨‍💻';
    }
  };
  
  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  if (isLoading && !userStats) {
    return (
      <div className="space-y-4">
        {[...Array(compact ? 2 : 4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!userStats) return null;

  const levelProgress = levelSystem ? levelSystem.level_progress_percentage : 0;
  const nextLevelPoints = levelSystem ? levelSystem.next_level_points - levelSystem.current_points : 0;

  return (
    <div className="space-y-6">
      {/* Level System */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {levelSystem ? getLevelIcon(levelSystem.current_level) : '👨‍💻'}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {levelSystem ? getLevelName(levelSystem.current_level) : 'Developer'}
                </CardTitle>
                <CardDescription>
                  {userStats.total_points} баллов • До следующего уровня: {nextLevelPoints}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Уровень {userStats.current_level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс до следующего уровня</span>
              <span className="font-medium">{levelProgress.toFixed(1)}%</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Main Statistics */}
      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-4'} gap-4`}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userStats.completed_lessons}/{userStats.total_lessons}
                </p>
                <p className="text-sm text-muted-foreground">Уроки</p>
                <div className="mt-1">
                  <Progress 
                    value={getProgressPercentage(userStats.completed_lessons, userStats.total_lessons)} 
                    className="h-1" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Code className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userStats.solved_problems}/{userStats.total_problems}
                </p>
                <p className="text-sm text-muted-foreground">Задачи</p>
                <div className="mt-1">
                  <Progress 
                    value={getProgressPercentage(userStats.solved_problems, userStats.total_problems)} 
                    className="h-1" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userStats.passed_tests}/{userStats.total_tests}
                </p>
                <p className="text-sm text-muted-foreground">Тесты</p>
                <div className="mt-1">
                  <Progress 
                    value={getProgressPercentage(userStats.passed_tests, userStats.total_tests)} 
                    className="h-1" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.total_points}</p>
                <p className="text-sm text-muted-foreground">Баллы</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+50 за неделю</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Streak & Achievements */}
      {showDetailed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Learning Streak */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">Серия обучения</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {learningStreak ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {learningStreak.current_streak}
                    </div>
                    <p className="text-sm text-muted-foreground">дней подряд</p>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Лучшая серия:</span>
                      <span className="ml-2 font-medium">{learningStreak.longest_streak} дней</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {learningStreak.streak_maintained ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                      <span className={learningStreak.streak_maintained ? 'text-green-600' : 'text-orange-500'}>
                        {learningStreak.streak_maintained ? 'Активна' : 'Под угрозой'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3 text-sm">
                    <p className="text-orange-800">
                      💡 Занимайтесь каждый день, чтобы поддерживать серию!
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Данные о серии недоступны</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-lg">Достижения</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {levelSystem?.achievements ? (
                <div className="space-y-3">
                  {levelSystem.achievements
                    .filter(achievement => achievement.is_unlocked)
                    .slice(-3)
                    .map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          +{achievement.points}
                        </Badge>
                      </div>
                    ))}
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      {levelSystem.achievements.filter(a => !a.is_unlocked).length} достижений ожидают разблокировки
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Достижения загружаются...</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Certificates */}
      {userStats.certificates_count > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Star className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">Получено сертификатов: {userStats.certificates_count}</p>
                <p className="text-sm text-muted-foreground">
                  Поздравляем с успешным завершением курсов!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};