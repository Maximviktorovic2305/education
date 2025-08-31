'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CodeExecutor } from '@/components/editor/code-executor';
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Target,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

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

interface PracticeSectionProps {
  lessonId: number;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export const PracticeSection: React.FC<PracticeSectionProps> = ({
  onComplete,
  isCompleted = false,
}) => {
  const [hasCompletedTask, setHasCompletedTask] = useState(false);

  // Sample practice task based on lesson
  const practiceTask = {
    title: 'Практическое задание',
    description: 'Попробуйте написать код, используя изученные концепции.',
    initialCode: `package main

import "fmt"

func main() {
    // Ваш код здесь
    
}`,
    testCases: [
      {
        input: '',
        expectedOutput: 'Hello, World!',
        description: 'Программа должна вывести "Hello, World!"'
      },
      {
        input: '',
        expectedOutput: 'Hello, World!',
        description: 'Проверка корректности вывода'
      }
    ],
    hints: [
      'Не забудьте импортировать необходимые пакеты',
      'Используйте fmt.Println() для вывода результата',
      'Проверьте синтаксис Go'
    ]
  };

  const handleSuccess = () => {
    setHasCompletedTask(true);
    toast.success('Отличная работа! Задание выполнено корректно.');
  };

  const handleComplete = () => {
    if (!hasCompletedTask) {
      toast.warning('Сначала успешно выполните практическое задание');
      return;
    }
    
    onComplete?.();
    toast.success('Практическое задание завершено!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {practiceTask.title}
          {isCompleted && (
            <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
          )}
        </CardTitle>
        <CardDescription>
          {practiceTask.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Task Instructions */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Задание
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Напишите программу на Go, которая выводит &quot;Hello, World!&quot; на экран.
                  Используйте функцию fmt.Println().
                </p>
              </div>
            </div>
          </div>

          {/* Expected Output */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Ожидаемый результат:</h4>
            <div className="bg-muted p-3 rounded-lg text-sm font-mono">
              {practiceTask.testCases[0].expectedOutput}
            </div>
          </div>
        </div>

        <Separator />

        {/* Monaco Code Editor */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Редактор кода:</h4>
          <CodeExecutor
            initialCode={practiceTask.initialCode}
            testCases={practiceTask.testCases}
            onSuccess={handleSuccess}
            className="border rounded-lg"
          />
        </div>

        {/* Hints */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <h4 className="text-sm font-medium">Подсказки:</h4>
          </div>
          <ul className="space-y-2">
            {practiceTask.hints.map((hint, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-3 w-3 mt-1 flex-shrink-0" />
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Complete Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isCompleted ? 'Практическое задание завершено' : hasCompletedTask ? 'Задание выполнено успешно!' : 'Выполните задание для продолжения'}
          </div>
          <Button
            onClick={handleComplete}
            disabled={isCompleted || !hasCompletedTask}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Завершено
              </>
            ) : (
              'Отметить как выполненное'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};