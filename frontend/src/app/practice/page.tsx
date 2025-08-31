'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ProblemList } from '@/components/problems/problem-list';
import { ProblemDetail } from '@/components/problems/problem-detail';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthStore } from '@/store/auth';
import { useProblemStore } from '@/store/problem';
import { ArrowLeft, Code, User, LogOut, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Problem } from '@/types';
import Link from 'next/link';

// Mock problems data - in real implementation this would come from the API
const mockProblems: Problem[] = [
  {
    id: 1,
    title: 'Hello, World!',
    description: 'Напишите программу, которая выводит "Hello, World!" на экран.',
    difficulty: 'easy',
    initial_code: `package main\n\nimport "fmt"\n\nfunc main() {\n    // Ваш код здесь\n    \n}`,
    test_cases: JSON.stringify([{
      input: '',
      expected_output: 'Hello, World!',
      explanation: 'Программа должна вывести "Hello, World!"'
    }]),
    points: 5,
    time_limit: 1000,
    memory_limit: 65536,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Сумма двух чисел',
    description: 'Напишите функцию, которая принимает два числа и возвращает их сумму.\n\nФункция должна называться add и принимать два параметра типа int.',
    difficulty: 'easy',
    initial_code: `package main\n\nimport "fmt"\n\nfunc add(a, b int) int {\n    // Ваш код здесь\n    return 0\n}\n\nfunc main() {\n    result := add(5, 3)\n    fmt.Println(result)\n}`,
    test_cases: JSON.stringify([{
      input: '',
      expected_output: '8',
      explanation: 'add(5, 3) должно возвращать 8'
    }]),
    points: 10,
    time_limit: 1000,
    memory_limit: 65536,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Факториал числа',
    description: 'Напишите функцию для вычисления факториала числа n.\n\nФакториал n! = 1 × 2 × 3 × ... × n\nДля n = 0, факториал равен 1.',
    difficulty: 'medium',
    initial_code: `package main\n\nimport "fmt"\n\nfunc factorial(n int) int {\n    // Ваш код здесь\n    return 1\n}\n\nfunc main() {\n    result := factorial(5)\n    fmt.Println(result)\n}`,
    test_cases: JSON.stringify([{
      input: '5',
      expected_output: '120',
      explanation: '5! = 1 × 2 × 3 × 4 × 5 = 120'
    }]),
    points: 20,
    time_limit: 1000,
    memory_limit: 65536,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Поиск максимального элемента',
    description: 'Найдите максимальный элемент в массиве целых чисел.\n\nВерните значение максимального элемента.',
    difficulty: 'medium',
    initial_code: `package main\n\nimport "fmt"\n\nfunc findMax(arr []int) int {\n    // Ваш код здесь\n    return 0\n}\n\nfunc main() {\n    numbers := []int{3, 7, 2, 9, 1}\n    result := findMax(numbers)\n    fmt.Println(result)\n}`,
    test_cases: JSON.stringify([{
      input: '[3, 7, 2, 9, 1]',
      expected_output: '9',
      explanation: 'Максимальный элемент в массиве [3, 7, 2, 9, 1] это 9'
    }]),
    points: 25,
    time_limit: 1000,
    memory_limit: 65536,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Проверка палиндрома',
    description: 'Проверьте, является ли строка палиндромом.\n\nПалиндром - это строка, которая читается одинаково слева направо и справа налево.',
    difficulty: 'hard',
    initial_code: `package main\n\nimport "fmt"\n\nfunc isPalindrome(s string) bool {\n    // Ваш код здесь\n    return false\n}\n\nfunc main() {\n    result := isPalindrome("racecar")\n    fmt.Println(result)\n}`,
    test_cases: JSON.stringify([{
      input: 'racecar',
      expected_output: 'true',
      explanation: '"racecar" является палиндромом'
    }]),
    points: 35,
    time_limit: 1000,
    memory_limit: 65536,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export default function PracticePage() {
  const { user, logout } = useAuthStore();
  const { setCurrentProblem } = useProblemStore();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    // Initialize with mock data
    // In real implementation, this would fetch from API
    // fetchProblems();
  }, []);

  const handleProblemSelect = (problem: Problem) => {
    setSelectedProblem(problem);
    setCurrentProblem(problem);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProblem(null);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Code className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">Практические задачи</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-4rem)]">
          {viewMode === 'list' ? (
            <>
              {/* Problems List */}
              <div className="w-80 border-r">
                <ProblemList
                  onProblemSelect={handleProblemSelect}
                  selectedProblemId={selectedProblem?.id}
                  showFilters={true}
                  compact={false}
                />
              </div>

              {/* Welcome/Stats Panel */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Добро пожаловать в практику!</h3>
                  <p className="text-muted-foreground mb-6">
                    Выберите задачу из списка слева, чтобы начать решение.
                    Проверьте свои навыки программирования на Go!
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{mockProblems.filter(p => p.difficulty === 'easy').length}</div>
                      <div className="text-muted-foreground">Легких</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{mockProblems.filter(p => p.difficulty === 'medium').length}</div>
                      <div className="text-muted-foreground">Средних</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{mockProblems.filter(p => p.difficulty === 'hard').length}</div>
                      <div className="text-muted-foreground">Сложных</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            selectedProblem && (
              <ProblemDetail
                problem={selectedProblem}
                onBack={handleBackToList}
              />
            )
          )}
        </div>
      </div>
    </AuthGuard>
  );
}