'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  Play,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { useTestStore } from '@/store/test';
import { Test } from '@/types';

interface TestListProps {
  onTestSelect?: (test: Test) => void;
  selectedTestId?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export const TestList: React.FC<TestListProps> = ({
  onTestSelect,
  selectedTestId,
  showFilters = true,
  compact = false,
}) => {
  const {
    tests,
    filters,
    pagination,
    isLoading,
    error,
    userProgress,
    fetchTests,
    fetchUserProgress,
    setFilters,
    clearError,
  } = useTestStore();

  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  useEffect(() => {
    fetchTests();
    fetchUserProgress();
  }, [fetchTests, fetchUserProgress]);

  const handleSearch = () => {
    setFilters({ search: searchTerm });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDifficultyFilter = (difficulty: string) => {
    setFilters({ difficulty: difficulty === 'all' ? undefined : difficulty });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ status: status === 'all' ? undefined : status });
  };

  const handlePageChange = (page: number) => {
    fetchTests(page);
  };

  const getDifficultyLevel = (test: Test) => {
    if (test.pass_score >= 80) return { label: 'Сложный', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
    if (test.pass_score >= 70) return { label: 'Средний', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
    return { label: 'Легкий', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-destructive mb-2">{error}</p>
        <Button size="sm" onClick={clearError} variant="outline">
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Progress Stats */}
      {!compact && userProgress && (
        <div className="p-4 border-b bg-muted/50">
          <h3 className="font-semibold mb-3">Статистика тестирования</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Пройдено тестов:</span>
                <span className="font-medium">{userProgress.completed_tests}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Средний балл:</span>
                <span className="font-medium">{userProgress.average_score}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Успешно сдано:</span>
                <span className="font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  {userProgress.passed_tests}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Заработано баллов:</span>
                <span className="font-medium flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-yellow-600" />
                  {userProgress.total_points}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Прогресс</span>
              <span>{userProgress.completed_tests}/{userProgress.total_tests}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(userProgress.completed_tests / userProgress.total_tests) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск тестов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSearch}>
              Найти
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Select onValueChange={handleDifficultyFilter} defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Сложность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="easy">Легкие</SelectItem>
                <SelectItem value="medium">Средние</SelectItem>
                <SelectItem value="hard">Сложные</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={handleStatusFilter} defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="completed">Пройденные</SelectItem>
                <SelectItem value="available">Доступные</SelectItem>
              </SelectContent>
            </Select>
            
            <Button size="sm" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Test List */}
      <ScrollArea className="flex-1">
        {isLoading && tests.length === 0 ? (
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {tests.map((test) => {
              const difficulty = getDifficultyLevel(test);
              const questionsCount = test.questions?.length || 0;
              
              return (
                <Card
                  key={test.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTestId === test.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  } ${compact ? 'p-2' : ''}`}
                  onClick={() => onTestSelect?.(test)}
                >
                  <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className={`${compact ? 'text-sm' : 'text-base'} truncate`}>
                            {test.title}
                          </CardTitle>
                          {!compact && (
                            <CardDescription className="text-xs mt-1 line-clamp-2">
                              {test.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={difficulty.color}>
                          {difficulty.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {!compact && (
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            <span>{test.points} баллов</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(test.time_limit)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{questionsCount} вопросов</span>
                          </div>
                        </div>
                        <div className="text-xs">
                          Проходной: {test.pass_score}%
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          #{test.id}
                        </div>
                        <Button size="sm" className="h-7 px-3">
                          <Play className="h-3 w-3 mr-1" />
                          Начать тест
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Страница {pagination.page} из {pagination.pages} 
              ({pagination.total} тестов)
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                {pagination.page}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};