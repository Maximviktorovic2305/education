package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"go-education-platform/internal/models"
)

type SandboxService struct {
	tempDir       string
	defaultTimeout time.Duration
}

func NewSandboxService() *SandboxService {
	tempDir := filepath.Join(os.TempDir(), "go-sandbox")
	os.MkdirAll(tempDir, 0755)
	
	return &SandboxService{
		tempDir:       tempDir,
		defaultTimeout: 10 * time.Second,
	}
}

// TestCase представляет отдельный тест-кейс
type TestCase struct {
	Input    string `json:"input"`
	Expected string `json:"expected"`
	Name     string `json:"name,omitempty"`
}

// ExecutionResult результат выполнения кода
type ExecutionResult struct {
	Status        models.SubmissionStatus `json:"status"`
	Output        string                  `json:"output"`
	ErrorOutput   string                  `json:"error"`
	ExecutionTime int                     `json:"execution_time"` // в миллисекундах
	MemoryUsed    int                     `json:"memory_used"`    // в байтах
	TestsPassed   int                     `json:"tests_passed"`
	TestsTotal    int                     `json:"tests_total"`
	Score         int                     `json:"score"`
}

// ExecuteCode выполняет Go код с заданными тест-кейсами
func (s *SandboxService) ExecuteCode(code string, testCases []TestCase, timeLimit int) (*ExecutionResult, error) {
	if timeLimit <= 0 {
		timeLimit = 5 // секунды по умолчанию
	}

	timeout := time.Duration(timeLimit) * time.Second
	if timeout > s.defaultTimeout {
		timeout = s.defaultTimeout
	}

	// Создаем временную директорию для выполнения
	execDir := filepath.Join(s.tempDir, fmt.Sprintf("exec_%d", time.Now().UnixNano()))
	if err := os.MkdirAll(execDir, 0755); err != nil {
		return nil, fmt.Errorf("ошибка создания временной директории: %w", err)
	}
	defer os.RemoveAll(execDir)

	// Подготавливаем полный код с функцией main
	fullCode := s.prepareCode(code)
	
	// Создаем файл с кодом
	codeFile := filepath.Join(execDir, "main.go")
	if err := os.WriteFile(codeFile, []byte(fullCode), 0644); err != nil {
		return nil, fmt.Errorf("ошибка записи кода в файл: %w", err)
	}

	result := &ExecutionResult{
		Status:      models.SubmissionStatusRunning,
		TestsTotal:  len(testCases),
		TestsPassed: 0,
		Score:       0,
	}

	// Компилируем код
	start := time.Now()
	if err := s.compileCode(execDir, timeout); err != nil {
		result.Status = models.SubmissionStatusCompileError
		result.ErrorOutput = err.Error()
		return result, nil
	}

	// Выполняем тесты
	for i, testCase := range testCases {
		testResult, err := s.runTest(execDir, testCase, timeout)
		if err != nil {
			result.Status = models.SubmissionStatusRuntimeError
			result.ErrorOutput = err.Error()
			break
		}

		if testResult.Success {
			result.TestsPassed++
		} else {
			// Если тест не прошёл, записываем детали
			if result.ErrorOutput == "" {
				result.ErrorOutput = fmt.Sprintf("Тест %d не пройден:\nВход: %s\nОжидалось: %s\nПолучено: %s",
					i+1, testCase.Input, testCase.Expected, testResult.Output)
			}
		}

		// Обновляем время выполнения (берём максимальное)
		if testResult.ExecutionTime > result.ExecutionTime {
			result.ExecutionTime = testResult.ExecutionTime
		}
	}

	result.ExecutionTime = int(time.Since(start).Milliseconds())

	// Определяем финальный статус
	if result.Status == models.SubmissionStatusRunning {
		if result.TestsPassed == result.TestsTotal {
			result.Status = models.SubmissionStatusAccepted
			result.Score = 100
		} else {
			result.Status = models.SubmissionStatusWrongAnswer
			result.Score = (result.TestsPassed * 100) / result.TestsTotal
		}
	}

	return result, nil
}

// TestResult результат выполнения одного теста
type TestResult struct {
	Success       bool   `json:"success"`
	Output        string `json:"output"`
	ErrorOutput   string `json:"error"`
	ExecutionTime int    `json:"execution_time"` // в миллисекундах
}

// compileCode компилирует Go код
func (s *SandboxService) compileCode(execDir string, timeout time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "build", "-o", "program", "main.go")
	cmd.Dir = execDir
	
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("превышено время компиляции")
		}
		return fmt.Errorf("ошибка компиляции: %s", stderr.String())
	}

	return nil
}

// runTest выполняет один тест
func (s *SandboxService) runTest(execDir string, testCase TestCase, timeout time.Duration) (*TestResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	programPath := filepath.Join(execDir, "program")
	if _, err := os.Stat(programPath); os.IsNotExist(err) {
		programPath = filepath.Join(execDir, "program.exe") // Windows
	}

	cmd := exec.CommandContext(ctx, programPath)
	cmd.Dir = execDir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Stdin = strings.NewReader(testCase.Input)

	start := time.Now()
	err := cmd.Run()
	executionTime := int(time.Since(start).Milliseconds())

	result := &TestResult{
		ExecutionTime: executionTime,
		Output:        strings.TrimSpace(stdout.String()),
		ErrorOutput:   stderr.String(),
	}

	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return nil, fmt.Errorf("превышено время выполнения")
		}
		return result, nil // Возвращаем результат с ошибкой, но не прерываем
	}

	// Сравниваем вывод с ожидаемым результатом
	expected := strings.TrimSpace(testCase.Expected)
	result.Success = result.Output == expected

	return result, nil
}

// prepareCode подготавливает код для выполнения
func (s *SandboxService) prepareCode(userCode string) string {
	// Если код уже содержит функцию main, используем его как есть
	if strings.Contains(userCode, "func main()") {
		// Проверяем, есть ли package main
		if !strings.Contains(userCode, "package main") {
			return "package main\n\n" + userCode
		}
		return userCode
	}

	// Если это функция, обёртываем её в main
	if strings.Contains(userCode, "func ") {
		return fmt.Sprintf(`package main

import (
	"fmt"
	"os"
	"bufio"
	"strings"
	"strconv"
)

%s

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	if scanner.Scan() {
		input := scanner.Text()
		// Попытка вызвать пользовательскую функцию
		// Это требует более сложной логики для определения сигнатуры функции
		fmt.Println("Результат:", input)
	}
}`, userCode)
	}

	// Если это просто код без функций, добавляем main
	return fmt.Sprintf(`package main

import (
	"fmt"
	"os"
	"bufio"
	"strings"
	"strconv"
)

func main() {
	%s
}`, userCode)
}

// ParseTestCases парсит JSON строку с тест-кейсами
func (s *SandboxService) ParseTestCases(testCasesJSON string) ([]TestCase, error) {
	var testCases []TestCase
	if err := json.Unmarshal([]byte(testCasesJSON), &testCases); err != nil {
		return nil, fmt.Errorf("ошибка парсинга тест-кейсов: %w", err)
	}
	return testCases, nil
}

// ExecuteSubmission выполняет отправку решения
func (s *SandboxService) ExecuteSubmission(submission *models.UserSubmission, problem *models.Problem) (*ExecutionResult, error) {
	// Парсим тест-кейсы
	testCases, err := s.ParseTestCases(problem.TestCases)
	if err != nil {
		return nil, err
	}

	// Выполняем код
	return s.ExecuteCode(submission.Code, testCases, problem.TimeLimit)
}