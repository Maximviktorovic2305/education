'use client';

import { useState } from 'react';
import { MonacoCodeEditor } from './monaco-editor';
import { api } from '@/api/client';
import { toast } from 'sonner';

interface CodeExecutorProps {
  initialCode?: string;
  testCases?: TestCase[];
  problemId?: number;
  onSuccess?: (result: ExecutionResult) => void;
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

const defaultGoCode = `package main

import "fmt"

func main() {
    // Ваш код здесь
    fmt.Println("Hello, World!")
}`;

export const CodeExecutor: React.FC<CodeExecutorProps> = ({
  initialCode = defaultGoCode,
  testCases = [],
  problemId,
  onSuccess,
  className = '',
}) => {
  const [code, setCode] = useState(initialCode);

  const executeCode = async (sourceCode: string): Promise<ExecutionResult> => {
    try {
      // Call the backend sandbox API
      const response = await api.protected.post<{
        success: boolean;
        output: string;
        error?: string;
        execution_time?: number;
        memory_usage?: number;
      }>('/sandbox/run', {
        code: sourceCode,
        language: 'go',
        test_cases: testCases,
      });

      const result: ExecutionResult = {
        success: response.success,
        output: response.output,
        error: response.error,
        executionTime: response.execution_time,
        memoryUsage: response.memory_usage,
      };

      // Run test cases if provided
      if (testCases.length > 0) {
        result.testResults = await runTestCases(sourceCode, testCases);
      }

      // Call success callback if all tests passed
      if (result.success && result.testResults?.every(t => t.passed)) {
        onSuccess?.(result);
      }

      return result;
    } catch {
      const errorMessage = 'Неизвестная ошибка';
      
      return {
        success: false,
        output: '',
        error: errorMessage,
      };
    }
  };

  const runTestCases = async (sourceCode: string, tests: TestCase[]): Promise<TestResult[]> => {
    const results: TestResult[] = [];

    for (const testCase of tests) {
      try {
        // Mock test execution - in real implementation, this would be handled by the backend
        const response = await api.protected.post<{
          success: boolean;
          output: string;
          error?: string;
        }>('/sandbox/test', {
          code: sourceCode,
          input: testCase.input,
        });

        const actualOutput = response.output.trim();
        const expectedOutput = testCase.expectedOutput.trim();
        
        results.push({
          passed: response.success && actualOutput === expectedOutput,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: actualOutput,
          description: testCase.description,
        });
      } catch {
        results.push({
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: 'Ошибка выполнения теста',
          description: testCase.description,
        });
      }
    }

    return results;
  };

  const handleSubmit = async () => {
    if (!problemId) {
      toast.error('ID задачи не указан');
      return;
    }

    try {
      const result = await executeCode(code);
      
      if (result.success && result.testResults?.every(t => t.passed)) {
        // Submit solution to the backend
        await api.protected.post(`/problems/${problemId}/submit`, {
          code,
          language: 'go',
        });
        
        toast.success('Решение отправлено успешно!');
      } else {
        toast.warning('Не все тесты пройдены. Проверьте ваше решение.');
      }
    } catch {
      toast.error('Ошибка при отправке решения');
    }
  };

  return (
    <div className={className}>
      <MonacoCodeEditor
        value={code}
        onChange={setCode}
        language="go"
        height="500px"
        showRunButton={true}
        showCopyButton={true}
        showResetButton={true}
        initialCode={initialCode}
        testCases={testCases}
        onRun={executeCode}
      />
      
      {problemId && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Отправить решение
          </button>
        </div>
      )}
    </div>
  );
};