'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Target,
  Download,
  Share2,
  RotateCcw,
  User,
  Award,
  TrendingUp
} from 'lucide-react';
import { useTestStore } from '@/store/test';
import { Test, TestResult, TestQuestion } from '@/types';

interface TestResultDisplayProps {
  test: Test;
  result: TestResult;
  onRetake?: () => void;
  onClose?: () => void;
  showAnswerReview?: boolean;
}

export const TestResultDisplay: React.FC<TestResultDisplayProps> = ({
  test,
  result,
  onRetake,
  onClose,
  showAnswerReview = true,
}) => {
  const { fetchUserProgress } = useTestStore();

  useEffect(() => {
    // Update user progress after test completion
    fetchUserProgress();
  }, [fetchUserProgress]);

  const userAnswers = result.answers ? JSON.parse(result.answers) : {};
  const questions = test.questions || [];
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м ${secs}с`;
    }
    return `${minutes}м ${secs}с`;
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { label: 'Отлично', color: 'text-green-600', icon: Award };
    if (percentage >= 80) return { label: 'Хорошо', color: 'text-blue-600', icon: Trophy };
    if (percentage >= 70) return { label: 'Удовлетворительно', color: 'text-yellow-600', icon: Target };
    return { label: 'Требует улучшения', color: 'text-red-600', icon: XCircle };
  };

  const performance = getPerformanceLevel(result.percentage);
  const PerformanceIcon = performance.icon;

  const getAnswerStatus = (question: TestQuestion, userAnswerId?: number) => {
    if (!userAnswerId) return { status: 'unanswered', color: 'text-gray-500' };
    
    const selectedAnswer = question.answers?.find(a => a.id === userAnswerId);
    const correctAnswer = question.answers?.find(a => a.is_correct);
    
    if (selectedAnswer?.is_correct) {
      return { status: 'correct', color: 'text-green-600' };
    }
    
    return { status: 'incorrect', color: 'text-red-600', correctAnswer };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Result Header */}
      <Card className={`border-2 ${result.is_passed ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {result.is_passed ? (
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            ) : (
              <div className="p-4 bg-red-100 rounded-full">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl mb-2">
            {result.is_passed ? 'Тест пройден успешно!' : 'Тест не пройден'}
          </CardTitle>
          
          <CardDescription className="text-lg">
            {test.title}
          </CardDescription>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge className={`px-4 py-2 text-base ${result.is_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {result.percentage}% ({result.score}/{result.max_score} баллов)
            </Badge>
            
            <Badge variant="outline" className="px-4 py-2 text-base">
              <PerformanceIcon className="h-4 w-4 mr-2" />
              {performance.label}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{result.score}</div>
            <div className="text-sm text-muted-foreground">Набрано баллов</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{result.percentage}%</div>
            <div className="text-sm text-muted-foreground">Процент правильных</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{formatTime(result.time_spent)}</div>
            <div className="text-sm text-muted-foreground">Времени потрачено</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{test.pass_score}%</div>
            <div className="text-sm text-muted-foreground">Проходной балл</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Результат тестирования</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ваш результат</span>
              <span className="font-medium">{result.percentage}%</span>
            </div>
            <Progress value={result.percentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Проходной балл: {test.pass_score}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Button onClick={onClose} variant="outline">
          Закрыть
        </Button>
        
        {!result.is_passed && onRetake && (
          <Button onClick={onRetake} className="bg-blue-600 hover:bg-blue-700">
            <RotateCcw className="h-4 w-4 mr-2" />
            Пройти заново
          </Button>
        )}
        
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Поделиться
        </Button>
        
        {result.is_passed && (
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Скачать сертификат
          </Button>
        )}
      </div>

      {/* Answer Review */}
      {showAnswerReview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Разбор ответов</CardTitle>
            <CardDescription>
              Просмотрите правильные и неправильные ответы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const userAnswerId = userAnswers[question.id];
                  const answerStatus = getAnswerStatus(question, userAnswerId);
                  const selectedAnswer = question.answers?.find(a => a.id === userAnswerId);
                  const correctAnswer = question.answers?.find(a => a.is_correct);
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0">
                          {answerStatus.status === 'correct' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                          ) : answerStatus.status === 'incorrect' ? (
                            <XCircle className="h-5 w-5 text-red-600 mt-1" />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-gray-300 mt-1" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">
                            Вопрос {index + 1}. {question.question}
                          </h4>
                          
                          <div className="space-y-2 text-sm">
                            {userAnswerId ? (
                              <div>
                                <span className="text-muted-foreground">Ваш ответ: </span>
                                <span className={answerStatus.color}>
                                  {selectedAnswer?.answer}
                                </span>
                              </div>
                            ) : (
                              <div className="text-gray-500">
                                Вопрос не был отвечен
                              </div>
                            )}
                            
                            {answerStatus.status === 'incorrect' && correctAnswer && (
                              <div>
                                <span className="text-muted-foreground">Правильный ответ: </span>
                                <span className="text-green-600 font-medium">
                                  {correctAnswer.answer}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {question.points} баллов
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};