'use client';

import { useRef, useState } from 'react';
import { Editor, OnMount, OnChange } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Copy, 
  Download, 
  RotateCcw, 
  Settings, 
  Maximize2, 
  Minimize2,
  Check,
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  height?: string | number;
  readOnly?: boolean;
  showRunButton?: boolean;
  showCopyButton?: boolean;
  showResetButton?: boolean;
  initialCode?: string;
  testCases?: TestCase[];
  onRun?: (code: string) => Promise<ExecutionResult>;
  className?: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

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

export const MonacoCodeEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language = 'go',
  height = 400,
  readOnly = false,
  showRunButton = true,
  showCopyButton = true,
  showResetButton = true,
  initialCode = '',
  testCases = [],
  onRun,
  className = '',
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { theme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(false);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize,
      wordWrap: wordWrap ? 'on' : 'off',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
    });

    // Add keyboard shortcuts
    editor.addCommand(
      // Using monaco KeyMod for Ctrl+Enter
      2048 | 3, // Ctrl (2048) + Enter (3)
      () => handleRunCode()
    );
  };

  const handleEditorChange: OnChange = (value) => {
    if (onChange && value !== undefined) {
      onChange(value);
    }
  };

  const handleRunCode = async () => {
    if (!onRun || isRunning) return;
    
    setIsRunning(true);
    setExecutionResult(null);
    
    try {
      const result = await onRun(value);
      setExecutionResult(result);
      
      if (result.success) {
        toast.success('Код выполнен успешно!');
      } else {
        toast.error('Ошибка выполнения кода');
      }
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
      toast.error('Произошла ошибка при выполнении');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(value);
    toast.success('Код скопирован в буфер обмена');
  };

  const handleResetCode = () => {
    if (onChange) {
      onChange(initialCode);
    }
    setExecutionResult(null);
    toast.info('Код сброшен к исходному состоянию');
  };

  const handleDownloadCode = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.go';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Код загружен');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24);
    setFontSize(newSize);
    editorRef.current?.updateOptions({ fontSize: newSize });
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 10);
    setFontSize(newSize);
    editorRef.current?.updateOptions({ fontSize: newSize });
  };

  const toggleWordWrap = () => {
    const newWrap = !wordWrap;
    setWordWrap(newWrap);
    editorRef.current?.updateOptions({ wordWrap: newWrap ? 'on' : 'off' });
  };

  return (
    <div className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {language === 'go' && <span className="text-blue-600 font-mono">go</span>}
              Редактор кода
              {!readOnly && (
                <Badge variant="outline" className="text-xs">
                  Ctrl+Enter для запуска
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Editor Controls */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 10}
                >
                  A-
                </Button>
                <span className="text-xs text-muted-foreground min-w-[2rem] text-center">
                  {fontSize}px
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={increaseFontSize}
                  disabled={fontSize >= 24}
                >
                  A+
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleWordWrap}
                title="Перенос строк"
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {showRunButton && onRun && (
              <Button
                size="sm"
                onClick={handleRunCode}
                disabled={isRunning || readOnly}
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Выполняется...' : 'Запустить'}
              </Button>
            )}
            
            {showCopyButton && (
              <Button size="sm" variant="outline" onClick={handleCopyCode}>
                <Copy className="h-4 w-4 mr-2" />
                Копировать
              </Button>
            )}
            
            {showResetButton && initialCode && !readOnly && (
              <Button size="sm" variant="outline" onClick={handleResetCode}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Сбросить
              </Button>
            )}
            
            <Button size="sm" variant="outline" onClick={handleDownloadCode}>
              <Download className="h-4 w-4 mr-2" />
              Скачать
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <Editor
              height={isFullscreen ? '60vh' : height}
              language={language}
              value={value}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                readOnly,
                fontSize,
                wordWrap: wordWrap ? 'on' : 'off',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
                lineNumbers: 'on',
                rulers: [80, 120],
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'mouseover',
                contextmenu: true,
                selectOnLineNumbers: true,
                roundedSelection: false,
                cursorStyle: 'line',
                autoIndent: 'full',
                tabSize: 4,
                insertSpaces: false,
              }}
            />
          </div>
          
          {/* Results Section */}
          {executionResult && (
            <div className="border-t">
              <Tabs defaultValue="output" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="output">Вывод</TabsTrigger>
                  {testCases.length > 0 && (
                    <TabsTrigger value="tests">
                      Тесты ({executionResult.testResults?.filter(t => t.passed).length || 0}/
                      {executionResult.testResults?.length || testCases.length})
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="stats">Статистика</TabsTrigger>
                </TabsList>
                
                <TabsContent value="output" className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {executionResult.success ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        {executionResult.success ? 'Успешно выполнено' : 'Ошибка выполнения'}
                      </span>
                    </div>
                    
                    {executionResult.output && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Результат:</h4>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          {executionResult.output}
                        </pre>
                      </div>
                    )}
                    
                    {executionResult.error && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-red-600">Ошибка:</h4>
                        <pre className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded text-sm overflow-x-auto text-red-900 dark:text-red-100">
                          {executionResult.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {testCases.length > 0 && (
                  <TabsContent value="tests" className="p-4">
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        {executionResult.testResults?.map((result, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {result.passed ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">
                                Тест {index + 1}
                                {result.description && `: ${result.description}`}
                              </span>
                            </div>
                            
                            {!result.passed && (
                              <div className="text-sm space-y-1 ml-6">
                                <div>
                                  <span className="text-muted-foreground">Ожидалось:</span>
                                  <pre className="bg-muted p-2 rounded mt-1">{result.expectedOutput}</pre>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Получено:</span>
                                  <pre className="bg-muted p-2 rounded mt-1">{result.actualOutput}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        )) || (
                          <div className="text-center text-muted-foreground">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                            <p>Результаты тестов недоступны</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                )}
                
                <TabsContent value="stats" className="p-4">
                  <div className="space-y-3">
                    {executionResult.executionTime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Время выполнения:</span>
                        <span>{executionResult.executionTime}ms</span>
                      </div>
                    )}
                    {executionResult.memoryUsage && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Использование памяти:</span>
                        <span>{executionResult.memoryUsage}KB</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Язык:</span>
                      <span className="uppercase">{language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Размер кода:</span>
                      <span>{value.length} символов</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Строк кода:</span>
                      <span>{value.split('\n').length}</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};