'use client';

import { useState } from 'react';
import { useNavigationStore } from '@/store/navigation';
import { useCourses, useCourseSections } from '@/hooks/queries/useCourses';
import { ChevronDown, ChevronRight, Book, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CourseSidebarProps {
  onLessonSelect?: (lessonId: number) => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({ onLessonSelect }) => {
  const { currentCourseId, currentLessonId, setCurrentCourseId, setCurrentLessonId } = useNavigationStore();
  
  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useCourses();
  
  // Fetch sections for current course
  const { data: sections = [], isLoading: sectionsLoading } = useCourseSections(currentCourseId || 0);
  
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const currentCourse = courses.find(course => course.id === currentCourseId) || null;

  const handleCourseSelect = (courseId: number) => {
    setCurrentCourseId(courseId);
    setExpandedSections(new Set()); // Collapse all sections when switching courses
  };

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleLessonClick = (lessonId: number) => {
    setCurrentLessonId(lessonId);
    if (onLessonSelect) {
      onLessonSelect(lessonId);
    }
  };

  if (coursesLoading && courses.length === 0) {
    return (
      <div className="w-80 border-r bg-muted/50 p-4">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="w-80 border-r bg-muted/50 p-4">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">Ошибка загрузки курсов</p>
          <Button size="sm" onClick={() => refetchCourses()}>
            Повторить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-muted/50 flex flex-col">
      {/* Course Selector */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">КУРСЫ</h3>
        <div className="space-y-2">
          {courses.map((course) => (
            <Button
              key={course.id}
              variant={currentCourseId === course.id ? 'default' : 'ghost'}
              className="w-full justify-start h-auto p-3"
              onClick={() => handleCourseSelect(course.id)}
            >
              <Book className="h-4 w-4 mr-2 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{course.title}</div>
                {course.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {course.description}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Course Content */}
      {currentCourse && (
        <ScrollArea className="flex-1">
          <div className="p-4">
            <h4 className="font-semibold mb-4">{currentCourse.title}</h4>
            
            {sectionsLoading && sections.length === 0 ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map((section) => (
                  <Collapsible
                    key={section.id}
                    open={expandedSections.has(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-2 font-medium"
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <span className="text-left flex-1">{section.title}</span>
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="ml-6">
                      <div className="space-y-1 mt-2">
                        {section.lessons?.map((lesson) => (
                          <Button
                            key={lesson.id}
                            variant={currentLessonId === lesson.id ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-auto p-2 text-sm"
                            onClick={() => handleLessonClick(lesson.id)}
                          >
                            <Circle className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="text-left flex-1">{lesson.title}</span>
                            <div className="flex items-center gap-1">
                              {lesson.points && (
                                <span className="text-xs text-muted-foreground">
                                  {lesson.points}pts
                                </span>
                              )}
                            </div>
                          </Button>
                        )) || (
                          <div className="text-xs text-muted-foreground p-2">
                            Уроки загружаются...
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {!currentCourse && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <Book className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Выберите курс для начала обучения</p>
          </div>
        </div>
      )}
    </div>
  );
};