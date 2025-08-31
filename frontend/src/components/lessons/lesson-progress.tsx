'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Trophy } from 'lucide-react';

interface LessonProgressProps {
  progress: number;
  totalSections: number;
  completedSections: number;
  estimatedTime?: number;
  points?: number;
  isCompleted?: boolean;
}

export const LessonProgress: React.FC<LessonProgressProps> = ({
  progress,
  totalSections,
  completedSections,
  estimatedTime = 15,
  points = 10,
  isCompleted = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Прогресс урока</span>
        <Badge variant={isCompleted ? 'default' : 'secondary'}>
          {Math.round(progress)}%
        </Badge>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>{completedSections}/{totalSections} разделов</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>~{estimatedTime} мин</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          <span>{points} баллов</span>
        </div>
      </div>
    </div>
  );
};