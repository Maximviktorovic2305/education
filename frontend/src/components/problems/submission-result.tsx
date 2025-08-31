'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  X, 
  Clock, 
  MemoryStick, 
  AlertTriangle,
  Code,
  BarChart3,
  Eye,
  Copy
} from 'lucide-react';
import { UserSubmission } from '@/types';
import { toast } from 'sonner';

interface SubmissionResultProps {
  submission: UserSubmission;
  onClose?: () => void;
  showCode?: boolean;
}

export const SubmissionResult: React.FC<SubmissionResultProps> = ({
  submission,
  onClose,
  showCode = true,
}) => {
  const [showFullCode, setShowFullCode] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'wrong_answer': return 'text-red-600 bg-red-50 dark:bg-red-950/20';
      case 'time_limit_exceeded': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
      case 'memory_limit_exceeded': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
      case 'compilation_error': return 'text-purple-600 bg-purple-50 dark:bg-purple-950/20';
      case 'runtime_error': return 'text-red-600 bg-red-50 dark:bg-red-950/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-5 w-5" />;
      case 'wrong_answer': return <X className="h-5 w-5" />;
      case 'time_limit_exceeded': return <Clock className="h-5 w-5" />;
      case 'memory_limit_exceeded': return <MemoryStick className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Решение принято';
      case 'wrong_answer': return 'Неверный ответ';
      case 'time_limit_exceeded': return 'Превышено время выполнения';
      case 'memory_limit_exceeded': return 'Превышен лимит памяти';
      case 'compilation_error': return 'Ошибка компиляции';
      case 'runtime_error': return 'Ошибка выполнения';
      case 'pending': return 'Ожидает проверки';
      case 'judging': return 'Выполняется проверка';
      default: return 'Неизвестный статус';
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(submission.code);
    toast.success('Код скопирован в буфер обмена');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(submission.status)}`}>
              {getStatusIcon(submission.status)}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusText(submission.status)}
                <Badge variant="outline" className={getScoreColor(submission.score)}>
                  {submission.score}/100
                </Badge>
              </CardTitle>
              <CardDescription>
                Отправлено {new Date(submission.created_at).toLocaleString('ru-RU')}
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Закрыть
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results">
              <BarChart3 className="h-4 w-4 mr-2" />
              Результаты
            </TabsTrigger>
            <TabsTrigger value="output">
              <Eye className="h-4 w-4 mr-2" />
              Вывод
            </TabsTrigger>
            {showCode && (
              <TabsTrigger value="code">
                <Code className="h-4 w-4 mr-2" />
                Код
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {submission.execution_time}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Время выполнения</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(submission.memory_usage / 1024)}KB
                  </div>
                  <div className="text-sm text-muted-foreground">Использованная память</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(submission.score)}`}>
                    {submission.score}%
                  </div>
                  <div className="text-sm text-muted-foreground">Результат</div>
                </div>
              </Card>
            </div>

            <Separator />

            {/* Test Results */}
            <div>
              <h4 className="font-medium mb-3">Результаты тестов</h4>
              {submission.status === 'accepted' ? (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Все тесты пройдены успешно!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Ваше решение корректно обрабатывает все тестовые случаи.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <X className="h-5 w-5" />
                      <span className="font-medium">Тесты не пройдены</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {getStatusText(submission.status)}
                    </p>
                  </div>

                  {/* Mock test cases - in real implementation, these would come from the backend */}
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Тест 1</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ввод: (пустой) → Ожидаемый вывод: Hello, World!
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Тест 2</span>
                        <X className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ввод: test input → Ожидаемый: expected output, Получен: actual output
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="output" className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Вывод программы</h4>
              {submission.output ? (
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto font-mono">
                  {submission.output}
                </pre>
              ) : (
                <p className="text-muted-foreground text-sm">Программа не производила вывода</p>
              )}
            </div>

            {submission.error && (
              <div>
                <h4 className="font-medium mb-3 text-red-600">Ошибки</h4>
                <pre className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-sm overflow-x-auto font-mono text-red-900 dark:text-red-100">
                  {submission.error}
                </pre>
              </div>
            )}
          </TabsContent>

          {showCode && (
            <TabsContent value="code" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Отправленный код</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyCode}>
                    <Copy className="h-4 w-4 mr-2" />
                    Копировать
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowFullCode(!showFullCode)}
                  >
                    {showFullCode ? 'Свернуть' : 'Развернуть'}
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg">
                <ScrollArea className={showFullCode ? 'h-96' : 'h-48'}>
                  <pre className="p-4 text-sm font-mono overflow-x-auto">
                    <code>{submission.code}</code>
                  </pre>
                </ScrollArea>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Язык: {submission.language.toUpperCase()} • 
                Размер: {submission.code.length} символов • 
                Строк: {submission.code.split('\n').length}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};