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
  Trophy, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Code,
  TrendingUp
} from 'lucide-react';
import { useProblems } from '@/hooks/queries/useProblems';
import { Problem } from '@/types';

interface ProblemListProps {
  onProblemSelect?: (problem: Problem) => void;
  selectedProblemId?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export const ProblemList: React.FC<ProblemListProps> = ({
  onProblemSelect,
  selectedProblemId,
  showFilters = true,
  compact = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filters = {
    search: searchTerm || undefined,
    difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };
  
  const { data: problemsData, isLoading, error } = useProblems(filters);
  
  const problems = problemsData?.data || [];
  const pagination = {
    page: problemsData?.page || 1,
    limit: problemsData?.limit || 10,
    total: problemsData?.total || 0,
    pages: problemsData?.pages || 1,
  };
  
  // Mock user progress data
  const userProgress = {
    total_solved: 0,
    acceptance_rate: 0,
    current_streak: 0,
    best_streak: 0,
    easy_solved: 0,
    medium_solved: 0,
    hard_solved: 0,
  };

  const handleSearch = () => {
    // Search is handled automatically by the query when searchTerm changes
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDifficultyFilter = (difficulty: string) => {
    setDifficultyFilter(difficulty);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handlePageChange = (page: number) => {
    // Page changes would need to be handled through a separate hook or state
    console.log('Page change to:', page);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легкая';
      case 'medium': return 'Средняя';
      case 'hard': return 'Сложная';
      default: return 'Неизвестно';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'solved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'attempted': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Code className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-destructive mb-2">{error.message || 'Ошибка загрузки задач'}</p>
        <Button size="sm" onClick={() => window.location.reload()} variant="outline">
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
          <h3 className="font-semibold mb-3">Статистика решений</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Решено задач:</span>
                <span className="font-medium">{userProgress.total_solved}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Процент принятых:</span>
                <span className="font-medium">{userProgress.acceptance_rate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Текущая серия:</span>
                <span className="font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {userProgress.current_streak}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Лучшая серия:</span>
                <span className="font-medium">{userProgress.best_streak}</span>
              </div>
            </div>
          </div>
          
          {/* Difficulty breakdown */}
          <div className="mt-3 flex gap-4 text-xs">
            <span className="text-green-600">Легкие: {userProgress.easy_solved}</span>
            <span className="text-yellow-600">Средние: {userProgress.medium_solved}</span>
            <span className="text-red-600">Сложные: {userProgress.hard_solved}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск задач..."
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
                <SelectItem value="solved">Решенные</SelectItem>
                <SelectItem value="attempted">Попытки</SelectItem>
                <SelectItem value="unsolved">Нерешенные</SelectItem>
              </SelectContent>
            </Select>
            
            <Button size="sm" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Problem List */}
      <ScrollArea className="flex-1">
        {isLoading && problems.length === 0 ? (
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {problems.map((problem) => (
              <Card
                key={problem.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProblemId === problem.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                } ${compact ? 'p-2' : ''}`}
                onClick={() => onProblemSelect?.(problem)}
              >
                <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      {getStatusIcon()}
                      <div className="min-w-0 flex-1">
                        <CardTitle className={`${compact ? 'text-sm' : 'text-base'} truncate`}>
                          {problem.title}
                        </CardTitle>
                        {!compact && (
                          <CardDescription className="text-xs mt-1 line-clamp-2">
                            {problem.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {getDifficultyText(problem.difficulty)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                {!compact && (
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          <span>{problem.points} баллов</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{problem.time_limit}ms</span>
                        </div>
                      </div>
                      <div className="text-xs">
                        #{problem.id}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Страница {pagination.page} из {pagination.pages} 
              ({pagination.total} задач)
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