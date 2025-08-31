'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { TestList } from '@/components/tests/test-list';
import { TestTaker } from '@/components/tests/test-taker';
import { TestResultDisplay } from '@/components/tests/test-result';
import { useProfile, useLogout } from '@/hooks/queries/useAuth';
import { useTests } from '@/hooks/queries/useTests';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, Code, User, LogOut, Target, Trophy } from 'lucide-react';
import { Test } from '@/types';
import Link from 'next/link';

type ViewMode = 'list' | 'taking' | 'result';

export default function TestsPage() {
  const { data: user } = useProfile();
  const { mutate: logout } = useLogout();
  const { data: testsData } = useTests();
  
  // For now, use mock data since we need to handle test state differently
  const currentTest = null;
  const currentTestResult = null;
  const isTestActive = false;
  
  const clearCurrentTest = () => {
    // TODO: Implement with TanStack Query
    console.log('Clear current test');
  };

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  useEffect(() => {
    if (isTestActive && currentTest) {
      setViewMode('taking');
      setSelectedTest(currentTest);
    } else if (currentTestResult && selectedTest) {
      setViewMode('result');
    } else {
      setViewMode('list');
    }
  }, [isTestActive, currentTest, currentTestResult, selectedTest]);

  const handleTestSelect = (test: Test) => {
    setSelectedTest(test);
    setViewMode('taking');
  };

  const handleTestComplete = () => {
    setViewMode('result');
  };

  const handleRetakeTest = () => {
    if (selectedTest) {
      clearCurrentTest();
      setViewMode('taking');
    }
  };

  const handleBackToList = () => {
    clearCurrentTest();
    setSelectedTest(null);
    setViewMode('list');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'taking':
        return selectedTest ? (
          <TestTaker
            test={selectedTest}
            onComplete={handleTestComplete}
            onExit={handleBackToList}
          />
        ) : null;

      case 'result':
        return selectedTest && currentTestResult ? (
          <TestResultDisplay
            test={selectedTest}
            result={currentTestResult}
            onRetake={handleRetakeTest}
            onClose={handleBackToList}
          />
        ) : null;

      default:
        return (
          <TestList
            onTestSelect={handleTestSelect}
            selectedTestId={selectedTest?.id}
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case 'taking':
        return `Прохождение теста: ${selectedTest?.title || 'Тест'}`;
      case 'result':
        return 'Результаты тестирования';
      default:
        return 'Тестирование знаний';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {viewMode !== 'list' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Назад к списку
                </Button>
              ) : (
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </Link>
              )}
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">{getPageTitle()}</h1>
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

        {/* Main Content */}
        <div className="h-[calc(100vh-4rem)]">
          {viewMode === 'list' ? (
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-80 border-r bg-muted/50">
                <TestList
                  onTestSelect={handleTestSelect}
                  selectedTestId={selectedTest?.id}
                  compact={false}
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-hidden">
                {selectedTest ? (
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                      <div className="p-6 bg-primary/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <Target className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-4">{selectedTest.title}</h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {selectedTest.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">Баллы</span>
                          </div>
                          <div className="text-lg font-semibold">{selectedTest.points}</div>
                        </div>
                        
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Проходной балл</span>
                          </div>
                          <div className="text-lg font-semibold">{selectedTest.pass_score}%</div>
                        </div>
                      </div>
                      
                      <Button 
                        size="lg" 
                        onClick={() => handleTestSelect(selectedTest)}
                        className="w-full"
                      >
                        Начать тестирование
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Выберите тест</h3>
                      <p className="text-muted-foreground">
                        Выберите тест из списка слева, чтобы начать тестирование
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}