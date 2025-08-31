'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { CourseSidebar } from '@/components/courses/course-sidebar';
import { LessonViewer } from '@/components/lessons/lesson-viewer';
import { useProfile, useLogout } from '@/hooks/queries/useAuth';
import { useCourses } from '@/hooks/queries/useCourses';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, Code, User, LogOut, Book } from 'lucide-react';
import Link from 'next/link';

export default function CoursesPage() {
  const { data: user } = useProfile();
  const { mutate: logout } = useLogout();
  
  // For now, we'll use mock data since we need to handle lesson selection differently
  const currentLesson = null;
  const sections = [];
  
  const handleLessonSelect = async (lessonId: number) => {
    // TODO: Implement with TanStack Query
    console.log('Select lesson:', lessonId);
  };

  const handleCompleteLesson = async () => {
    // TODO: Implement with TanStack Query
    console.log('Complete lesson');
  };

  // Find current lesson position for navigation
  const findLessonPosition = () => {
    if (!currentLesson || !sections) return { hasNext: false, hasPrevious: false };
    
    const allLessons = sections.flatMap(section => section.lessons || []);
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson.id);
    
    return {
      hasNext: currentIndex < allLessons.length - 1,
      hasPrevious: currentIndex > 0,
      nextLesson: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
      previousLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null
    };
  };

  const { hasNext, hasPrevious, nextLesson, previousLesson } = findLessonPosition();

  const handleNext = () => {
    if (nextLesson) {
      handleLessonSelect(nextLesson.id);
    }
  };

  const handlePrevious = () => {
    if (previousLesson) {
      handleLessonSelect(previousLesson.id);
    }
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
                <h1 className="text-xl font-bold">Курсы Go</h1>
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
          {/* Sidebar */}
          <CourseSidebar onLessonSelect={handleLessonSelect} />

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {currentLesson ? (
              <LessonViewer
                lesson={currentLesson}
                onComplete={handleCompleteLesson}
                onNext={handleNext}
                onPrevious={handlePrevious}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                isCompleted={false} // TODO: Get from progress store
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Book className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Выберите урок</h3>
                  <p className="text-muted-foreground">
                    Выберите курс и урок в боковой панели, чтобы начать обучение
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}