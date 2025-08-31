'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Calendar,
  Target,
  Star,
  Zap,
  Award
} from 'lucide-react';
import { useSkillProgress, useWeeklyActivity, useLearningStreak } from '@/hooks/queries/useProgress';

interface ProgressStatsProps {
  detailed?: boolean;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  detailed = true,
}) => {
  const { data: skillProgress = [], isLoading: skillLoading, error: skillError } = useSkillProgress();
  const { data: weeklyActivity = [], isLoading: weeklyLoading } = useWeeklyActivity();
  const { data: learningStreak } = useLearningStreak();
  
  const isLoading = skillLoading || weeklyLoading;
  const error = skillError;
  
  // Helper function
  const getTimeSpentFormatted = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const totalWeeklyTime = weeklyActivity.reduce((sum, day) => sum + day.time_spent, 0);
  const totalWeeklyLessons = weeklyActivity.reduce((sum, day) => sum + day.lessons_completed, 0);
  const totalWeeklyProblems = weeklyActivity.reduce((sum, day) => sum + day.problems_solved, 0);
  const totalWeeklyTests = weeklyActivity.reduce((sum, day) => sum + day.tests_passed, 0);

  const averageDailyTime = weeklyActivity.length > 0 ? Math.round(totalWeeklyTime / weeklyActivity.length) : 0;
  const mostActiveDay = weeklyActivity.reduce((max, day) => 
    (day.lessons_completed + day.problems_solved + day.tests_passed) > 
    (max.lessons_completed + max.problems_solved + max.tests_passed) ? day : max, 
    weeklyActivity[0] || { date: '', lessons_completed: 0, problems_solved: 0, tests_passed: 0, time_spent: 0 }
  );

  const getWeekDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  };

  const getSkillLevelName = (level: number) => {
    switch (level) {
      case 1: return 'Новичок';
      case 2: return 'Изучающий';
      case 3: return 'Практикующий';
      case 4: return 'Опытный';
      case 5: return 'Эксперт';
      default: return 'Неизвестно';
    }
  };

  const getSkillLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-gray-100 text-gray-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-green-100 text-green-800';
      case 4: return 'bg-yellow-100 text-yellow-800';
      case 5: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {detailed && (
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Недельная активность</TabsTrigger>
            <TabsTrigger value="skills">Навыки</TabsTrigger>
            <TabsTrigger value="insights">Аналитика</TabsTrigger>
          </TabsList>

          {/* Weekly Activity Tab */}
          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <CardTitle>Активность за неделю</CardTitle>
                </div>
                <CardDescription>
                  Ваша учебная активность за последние 7 дней
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalWeeklyLessons}</div>
                    <div className="text-sm text-blue-800">Уроков</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{totalWeeklyProblems}</div>
                    <div className="text-sm text-green-800">Задач</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{totalWeeklyTests}</div>
                    <div className="text-sm text-purple-800">Тестов</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {getTimeSpentFormatted(totalWeeklyTime)}
                    </div>
                    <div className="text-sm text-orange-800">Времени</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {weeklyActivity.map((day, index) => {
                    const totalActivity = day.lessons_completed + day.problems_solved + day.tests_passed;
                    const maxActivity = Math.max(...weeklyActivity.map(d => d.lessons_completed + d.problems_solved + d.tests_passed));
                    const activityPercentage = maxActivity > 0 ? (totalActivity / maxActivity) * 100 : 0;

                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-12 text-sm font-medium">
                          {getWeekDayName(day.date)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{totalActivity} активностей</span>
                            <span>{getTimeSpentFormatted(day.time_spent)}</span>
                          </div>
                          <Progress value={activityPercentage} className="h-2" />
                        </div>
                        <div className="flex gap-1 text-xs">
                          {day.lessons_completed > 0 && (
                            <Badge variant="secondary" className="px-1 py-0 text-xs">
                              {day.lessons_completed}У
                            </Badge>
                          )}
                          {day.problems_solved > 0 && (
                            <Badge variant="secondary" className="px-1 py-0 text-xs">
                              {day.problems_solved}З
                            </Badge>
                          )}
                          {day.tests_passed > 0 && (
                            <Badge variant="secondary" className="px-1 py-0 text-xs">
                              {day.tests_passed}Т
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <CardTitle>Прогресс по навыкам</CardTitle>
                </div>
                <CardDescription>
                  Ваш уровень владения различными аспектами Go
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skillProgress.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{skill.skill_name}</h4>
                          <Badge className={getSkillLevelColor(skill.level)}>
                            {getSkillLevelName(skill.level)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {skill.completed_exercises}/{skill.total_exercises}
                        </div>
                      </div>
                      <Progress value={skill.progress_percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Уровень {skill.level}</span>
                        <span>{skill.progress_percentage}% выполнено</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Время обучения</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold">
                        {getTimeSpentFormatted(averageDailyTime)}
                      </div>
                      <p className="text-sm text-muted-foreground">Среднее время в день</p>
                    </div>
                    
                    <div>
                      <div className="text-lg font-medium">
                        {getTimeSpentFormatted(totalWeeklyTime)}
                      </div>
                      <p className="text-sm text-muted-foreground">Всего за неделю</p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        💡 Рекомендуется заниматься 30-60 минут в день для эффективного обучения
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">Самый активный день</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-lg font-medium">
                        {getWeekDayName(mostActiveDay.date)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(mostActiveDay.date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Уроков:</span>
                        <span className="font-medium">{mostActiveDay.lessons_completed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Задач:</span>
                        <span className="font-medium">{mostActiveDay.problems_solved}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Время:</span>
                        <span className="font-medium">{getTimeSpentFormatted(mostActiveDay.time_spent)}</span>
                      </div>
                    </div>

                    {learningStreak && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800">
                            Серия: {learningStreak.current_streak} дней
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Stats for non-detailed view */}
      {!detailed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalWeeklyLessons}</div>
              <p className="text-sm text-muted-foreground">Уроков за неделю</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{totalWeeklyProblems}</div>
              <p className="text-sm text-muted-foreground">Задач решено</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalWeeklyTests}</div>
              <p className="text-sm text-muted-foreground">Тестов пройдено</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getTimeSpentFormatted(totalWeeklyTime)}
              </div>
              <p className="text-sm text-muted-foreground">Время обучения</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};