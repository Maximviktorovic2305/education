'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Book, 
  Code, 
  Play, 
  Copy, 
  CheckCircle, 
  Clock, 
  Trophy,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Target
} from 'lucide-react';
import { Lesson } from '@/types';
import { CodeBlock } from './code-block';
import { PracticeSection } from './practice-section';
import { toast } from 'sonner';

interface LessonViewerProps {
  lesson: Lesson;
  onComplete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isCompleted?: boolean;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  onComplete,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
  isCompleted = false,
}) => {
  const [readingProgress, setReadingProgress] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompletedSections(new Set());
    setReadingProgress(0);
  }, [lesson.id]);

  const handleSectionComplete = (sectionId: string) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionId);
    setCompletedSections(newCompleted);
    
    // Update progress based on completed sections
    const totalSections = 3; // Theory, Code Example, Practice
    const progress = (newCompleted.size / totalSections) * 100;
    setReadingProgress(progress);
  };

  const handleCompleteLesson = async () => {
    if (readingProgress < 100) {
      toast.warning('Пожалуйста, завершите все разделы урока');
      return;
    }
    
    onComplete?.();
    toast.success('Урок завершён!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Код скопирован в буфер обмена');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Lesson Header */}
      <div className="border-b p-6 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Урок #{lesson.order}</Badge>
              {isCompleted && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Завершён
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>{lesson.points} баллов</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>~15 мин</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Прогресс урока</span>
                <span className="text-sm text-muted-foreground">{Math.round(readingProgress)}%</span>
              </div>
              <Progress value={readingProgress} className="h-2" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
              Предыдущий
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!hasNext}
            >
              Следующий
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          
          {/* Theory Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Теория
                {completedSections.has('theory') && (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                )}
              </CardTitle>
              <CardDescription>
                Изучите основные концепции этого урока
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: lesson.content || 'Содержимое урока загружается...' 
                  }} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="h-4 w-4" />
                  <span>Важная информация для понимания концепций Go</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSectionComplete('theory')}
                  disabled={completedSections.has('theory')}
                >
                  {completedSections.has('theory') ? 'Изучено' : 'Отметить как изученное'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Code Example Section */}
          {lesson.code_example && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Пример кода
                  {completedSections.has('code') && (
                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                  )}
                </CardTitle>
                <CardDescription>
                  Практический пример использования изученных концепций
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  language="go"
                  code={lesson.code_example}
                  showLineNumbers
                  title="main.go"
                />
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Запустить код
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(lesson.code_example || '')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Копировать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSectionComplete('code')}
                    disabled={completedSections.has('code')}
                    className="ml-auto"
                  >
                    {completedSections.has('code') ? 'Изучено' : 'Отметить как изученное'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Practice Section */}
          <PracticeSection
            lessonId={lesson.id}
            onComplete={() => handleSectionComplete('practice')}
            isCompleted={completedSections.has('practice')}
          />

          {/* Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Прогресс: {completedSections.size}/3 разделов завершено
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Предыдущий урок
                  </Button>
                  
                  {readingProgress >= 100 ? (
                    <Button onClick={handleCompleteLesson}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Завершить урок
                    </Button>
                  ) : (
                    <Button disabled>
                      Завершите все разделы
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={onNext}
                    disabled={!hasNext}
                  >
                    Следующий урок
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};