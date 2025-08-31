'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  AlertTriangle,
  CheckCircle2,
  Target,
  Flag,
  User
} from 'lucide-react';
import { useTestStore } from '@/store/test';
import { Test, TestQuestion } from '@/types';

interface TestTakerProps {
  test: Test;
  onComplete?: () => void;
  onExit?: () => void;
}

export const TestTaker: React.FC<TestTakerProps> = ({
  test,
  onComplete,
  onExit,
}) => {
  const {
    isTestActive,
    timeRemaining,
    userAnswers,
    currentQuestionIndex,
    currentTestResult,
    isLoading,
    startTest,
    submitTest,
    setUserAnswer,
    setCurrentQuestionIndex,
    updateTimer,
  } = useTestStore();

  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    if (!isTestActive && !currentTestResult) {
      startTest(test.id);
    }
  }, [test.id, isTestActive, currentTestResult, startTest]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateTimer]);

  useEffect(() => {
    if (currentTestResult) {
      onComplete?.();
    }
  }, [currentTestResult, onComplete]);

  const questions = test.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(userAnswers).length;
  const progressPercentage = questions.length > 0 ? (answeredQuestions / questions.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerId: number) => {
    if (currentQuestion) {
      setUserAnswer(currentQuestion.id, answerId);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    if (answeredQuestions < questions.length) {
      setShowConfirmSubmit(true);
    } else {
      submitTest();
    }
  };

  const confirmSubmit = () => {
    setShowConfirmSubmit(false);
    submitTest();
  };

  if (!isTestActive || !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка теста...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{test.title}</h2>
              <p className="text-sm text-muted-foreground">
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className={`h-4 w-4 ${timeRemaining <= 300 ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span className={timeRemaining <= 300 ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            <Badge variant="outline">
              <Trophy className="h-3 w-3 mr-1" />
              {test.points} баллов
            </Badge>
          </div>
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Прогресс прохождения</span>
            <span>{answeredQuestions}/{questions.length} отвечено</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Question Navigation Sidebar */}
        <div className="w-48 border-r bg-muted/25 p-4">
          <h3 className="font-medium text-sm mb-3">Навигация по вопросам</h3>
          <ScrollArea className="h-full">
            <div className="grid grid-cols-4 gap-2">
              {questions.map((question, index) => {
                const isAnswered = userAnswers[question.id] !== undefined;
                const isCurrent = index === currentQuestionIndex;
                
                return (
                  <Button
                    key={question.id}
                    size="sm"
                    variant={isCurrent ? 'default' : isAnswered ? 'secondary' : 'outline'}
                    className={`w-full h-8 text-xs ${
                      isCurrent ? '' : isAnswered ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''
                    }`}
                    onClick={() => handleQuestionJump(index)}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Вопрос {currentQuestionIndex + 1}
                  </CardTitle>
                  <Badge variant="outline">
                    {currentQuestion.points} баллов
                  </Badge>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {currentQuestion.question}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <RadioGroup
                  value={userAnswers[currentQuestion.id]?.toString() || ''}
                  onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                  className="space-y-3"
                >
                  {currentQuestion.answers?.map((answer) => (
                    <div key={answer.id} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={answer.id.toString()}
                        id={`answer-${answer.id}`}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={`answer-${answer.id}`}
                        className="flex-1 text-sm leading-relaxed cursor-pointer py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {answer.answer}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </ScrollArea>

          {/* Navigation Footer */}
          <div className="border-t p-4 bg-muted/25">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Предыдущий
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Завершить тест
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Следующий
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <CardTitle>Подтвердите отправку</CardTitle>
              </div>
              <CardDescription>
                Вы ответили только на {answeredQuestions} из {questions.length} вопросов. 
                Неотвеченные вопросы не принесут баллов.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                  Отмена
                </Button>
                <Button onClick={confirmSubmit} className="bg-green-600 hover:bg-green-700">
                  Завершить тест
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};