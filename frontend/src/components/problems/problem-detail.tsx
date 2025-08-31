'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonacoCodeEditor } from '@/components/editor/monaco-editor';
import { 
  Trophy, 
  Clock, 
  MemoryStick, 
  CheckCircle, 
  X, 
  Send,
  BookOpen,
  Target,
  BarChart3,
  History
} from 'lucide-react';
import { Problem } from '@/types';
import { useProblemStore } from '@/store/problem';
import { toast } from 'sonner';

interface ProblemDetailProps {
  problem: Problem;
  onBack?: () => void;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
  memoryUsage?: number;
  testResults?: TestResult[];
}

interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  description?: string;
}

export const ProblemDetail: React.FC<ProblemDetailProps> = ({
  problem,
  onBack,
}) => {
  const {
    submissions,
    isLoading,
    submitSolution,
    fetchUserSubmissions,
  } = useProblemStore();

  const [code, setCode] = useState(problem.initial_code || getDefaultCode());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

  useEffect(() => {
    fetchUserSubmissions(problem.id);
  }, [problem.id, fetchUserSubmissions]);

  function getDefaultCode(): string {
    return `package main

import "fmt"

func main() {
    // Ваше решение здесь
    
}`;
  }

  const handleRunCode = async (): Promise<ExecutionResult> => {
    try {
      // Mock execution for demo - in real implementation this would call the sandbox API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple test based on problem type
      const result: ExecutionResult = {
        success: true,
        output: 'Hello, World!',
        executionTime: 45,
        memoryUsage: 1024,
        testResults: [{
          passed: true,
          input: '',
          expectedOutput: 'Hello, World!',
          actualOutput: 'Hello, World!',
          description: 'Базовый тест'
        }]
      };

      setLastResult(result);
      return result;
    } catch {
      const errorResult: ExecutionResult = {
        success: false,
        output: '',
        error: 'Ошибка выполнения',
      };
      setLastResult(errorResult);
      return errorResult;
    }
  };

  const handleSubmitSolution = async () => {
    if (!code.trim()) {
      toast.error('Пожалуйста, введите код решения');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSolution(problem.id, code, 'go');
      toast.success('Решение отправлено успешно!');
    } catch (error) {
      toast.error('Ошибка при отправке решения');
    } finally {
      setIsSubmitting(false);
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Принято
        </Badge>;
      case 'wrong_answer':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <X className="h-3 w-3 mr-1" />
          Неверный ответ
        </Badge>;
      case 'time_limit_exceeded':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Превышено время
        </Badge>;
      case 'memory_limit_exceeded':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
          <MemoryStick className="h-3 w-3 mr-1" />
          Превышена память
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Problem Header */}
      <div className="border-b p-6 bg-muted/50">
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              ← Назад к списку
            </Button>
          )}
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{problem.title}</h1>
              <Badge className={getDifficultyColor(problem.difficulty)}>
                {getDifficultyText(problem.difficulty)}
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>{problem.points} баллов</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Время: {problem.time_limit}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <MemoryStick className="h-4 w-4" />
                <span>Память: {problem.memory_limit}KB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Problem Description */}
        <div className="w-2/5 border-r flex flex-col">
          <Tabs defaultValue="description" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">
                <BookOpen className="h-4 w-4 mr-2" />
                Описание
              </TabsTrigger>
              <TabsTrigger value="submissions">
                <History className="h-4 w-4 mr-2" />
                Решения
              </TabsTrigger>
              <TabsTrigger value="statistics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Статистика
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Условие задачи</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {problem.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Примеры
                    </h4>
                    <div className="space-y-4">
                      {problem.test_cases ? JSON.parse(problem.test_cases).map((testCase: { input: string; expected_output: string; explanation?: string }, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="text-sm font-medium mb-2">Пример {index + 1}</div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Ввод:</span>
                              <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-x-auto">
                                {testCase.input || '(пустой)'}
                              </pre>
                            </div>
                            <div>
                              <span className="font-medium">Вывод:</span>
                              <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-x-auto">
                                {testCase.expected_output}
                              </pre>
                            </div>
                            {testCase.explanation && (
                              <div>
                                <span className="font-medium">Объяснение:</span>
                                <p className="text-muted-foreground mt-1">{testCase.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )) : (
                        <p className="text-muted-foreground text-sm">Примеры тестов недоступны</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Ограничения</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Время выполнения: {problem.time_limit}ms</li>
                      <li>• Память: {problem.memory_limit}KB</li>
                      <li>• Язык: Go</li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="submissions" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Ваши решения</h3>
                  {submissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Вы еще не отправляли решений для этой задачи
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((submission) => (
                        <Card key={submission.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            {getStatusBadge(submission.status)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(submission.created_at).toLocaleString('ru-RU')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Время: {submission.execution_time}ms</span>
                            <span>Память: {submission.memory_usage}KB</span>
                            <span>Баллы: {submission.score}/100</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="statistics" className="flex-1">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Статистика задачи</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">0</div>
                          <div className="text-sm text-muted-foreground">Решений принято</div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">0</div>
                          <div className="text-sm text-muted-foreground">Всего попыток</div>
                        </div>
                      </Card>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Уровень сложности</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(problem.difficulty)}>
                          {getDifficultyText(problem.difficulty)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {problem.points} баллов за решение
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <MonacoCodeEditor
            value={code}
            onChange={setCode}
            language="go"
            height="60%"
            showRunButton={true}
            showCopyButton={true}
            showResetButton={true}
            initialCode={problem.initial_code || getDefaultCode()}
            testCases={problem.test_cases ? JSON.parse(problem.test_cases) : []}
            onRun={handleRunCode}
          />
          
          {/* Submit Button */}
          <div className="p-4 border-t bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {lastResult && (
                  <span className={lastResult.success ? 'text-green-600' : 'text-red-600'}>
                    {lastResult.success ? 'Последний запуск: успешно' : 'Последний запуск: ошибка'}
                  </span>
                )}
              </div>
              <Button 
                onClick={handleSubmitSolution}
                disabled={isSubmitting || isLoading}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Отправить решение
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};