package services

import (
	"errors"
	"fmt"

	"go-education-platform/internal/models"

	"gorm.io/gorm"
)

type ProblemService struct {
	db *gorm.DB
}

func NewProblemService(db *gorm.DB) *ProblemService {
	return &ProblemService{db: db}
}

// GetProblems получает список задач с фильтрацией
func (s *ProblemService) GetProblems(difficulty string, page, limit int) ([]*models.Problem, int64, error) {
	var problems []*models.Problem
	var total int64

	query := s.db.Model(&models.Problem{}).Where("is_active = ?", true)

	// Фильтрация по сложности
	if difficulty != "" {
		query = query.Where("difficulty = ?", difficulty)
	}

	// Подсчитываем общее количество
	query.Count(&total)

	// Получаем задачи с пагинацией
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&problems).Error; err != nil {
		return nil, 0, fmt.Errorf("ошибка получения задач: %w", err)
	}

	return problems, total, nil
}

// GetProblemByID получает задачу по ID
func (s *ProblemService) GetProblemByID(id uint) (*models.Problem, error) {
	var problem models.Problem
	if err := s.db.Where("is_active = ?", true).
		First(&problem, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("задача не найдена")
		}
		return nil, fmt.Errorf("ошибка получения задачи: %w", err)
	}
	return &problem, nil
}

// CreateSubmission создает новую отправку решения
func (s *ProblemService) CreateSubmission(userID, problemID uint, code string) (*models.UserSubmission, error) {
	submission := &models.UserSubmission{
		UserID:    userID,
		ProblemID: problemID,
		Code:      code,
		Language:  "go",
		Status:    models.SubmissionStatusPending,
	}

	if err := s.db.Create(submission).Error; err != nil {
		return nil, fmt.Errorf("ошибка создания отправки: %w", err)
	}

	return submission, nil
}

// GetSubmissionByID получает отправку по ID
func (s *ProblemService) GetSubmissionByID(id uint) (*models.UserSubmission, error) {
	var submission models.UserSubmission
	if err := s.db.Preload("Problem").
		Preload("User").
		First(&submission, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("отправка не найдена")
		}
		return nil, fmt.Errorf("ошибка получения отправки: %w", err)
	}

	// Очищаем пароль пользователя
	if submission.User.ID != 0 {
		submission.User.Password = ""
	}

	return &submission, nil
}

// GetUserSubmissions получает отправки пользователя
func (s *ProblemService) GetUserSubmissions(userID uint, page, limit int) ([]*models.UserSubmission, int64, error) {
	var submissions []*models.UserSubmission
	var total int64

	// Подсчитываем общее количество
	s.db.Model(&models.UserSubmission{}).Where("user_id = ?", userID).Count(&total)

	// Получаем отправки с пагинацией
	offset := (page - 1) * limit
	if err := s.db.Where("user_id = ?", userID).
		Preload("Problem").
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&submissions).Error; err != nil {
		return nil, 0, fmt.Errorf("ошибка получения отправок пользователя: %w", err)
	}

	return submissions, total, nil
}

// UpdateSubmissionResult обновляет результат выполнения отправки
func (s *ProblemService) UpdateSubmissionResult(submissionID uint, result *SubmissionResult) error {
	updates := map[string]interface{}{
		"status":         result.Status,
		"score":          result.Score,
		"tests_passed":   result.TestsPassed,
		"tests_total":    result.TestsTotal,
		"execution_time": result.ExecutionTime,
		"memory_used":    result.MemoryUsed,
		"error_output":   result.ErrorOutput,
	}

	if err := s.db.Model(&models.UserSubmission{}).
		Where("id = ?", submissionID).
		Updates(updates).Error; err != nil {
		return fmt.Errorf("ошибка обновления результата отправки: %w", err)
	}

	// Если задача решена успешно, начисляем баллы пользователю
	if result.Status == models.SubmissionStatusAccepted {
		if err := s.updateUserPoints(submissionID); err != nil {
			// Логируем ошибку, но не прерываем выполнение
			fmt.Printf("Ошибка начисления баллов: %v\n", err)
		}
	}

	return nil
}

// updateUserPoints начисляет баллы пользователю за решение задачи
func (s *ProblemService) updateUserPoints(submissionID uint) error {
	var submission models.UserSubmission
	if err := s.db.Preload("Problem").
		Preload("User").
		First(&submission, submissionID).Error; err != nil {
		return err
	}

	// Проверяем, первое ли это успешное решение пользователем этой задачи
	var count int64
	s.db.Model(&models.UserSubmission{}).
		Where("user_id = ? AND problem_id = ? AND status = ? AND id < ?",
			submission.UserID, submission.ProblemID, models.SubmissionStatusAccepted, submissionID).
		Count(&count)

	// Начисляем баллы только за первое успешное решение
	if count == 0 {
		if err := s.db.Model(&models.User{}).
			Where("id = ?", submission.UserID).
			Update("points", gorm.Expr("points + ?", submission.Problem.Points)).Error; err != nil {
			return err
		}
	}

	return nil
}

// Admin methods

// CreateProblem создает новую задачу
func (s *ProblemService) CreateProblem(req *CreateProblemRequest) (*models.Problem, error) {
	problem := &models.Problem{
		Title:       req.Title,
		Description: req.Description,
		Difficulty:  models.ProblemLevel(req.Difficulty),
		InitialCode: req.InitialCode,
		TestCases:   req.TestCases,
		Points:      req.Points,
		TimeLimit:   req.TimeLimit,
		MemoryLimit: req.MemoryLimit,
		IsActive:    true,
	}

	if err := s.db.Create(problem).Error; err != nil {
		return nil, fmt.Errorf("ошибка создания задачи: %w", err)
	}

	return problem, nil
}

// UpdateProblem обновляет задачу
func (s *ProblemService) UpdateProblem(id uint, req *UpdateProblemRequest) (*models.Problem, error) {
	var problem models.Problem
	if err := s.db.First(&problem, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("задача не найдена")
		}
		return nil, fmt.Errorf("ошибка получения задачи: %w", err)
	}

	// Обновляем поля
	if req.Title != "" {
		problem.Title = req.Title
	}
	if req.Description != "" {
		problem.Description = req.Description
	}
	if req.Difficulty != "" {
		problem.Difficulty = models.ProblemLevel(req.Difficulty)
	}
	if req.InitialCode != "" {
		problem.InitialCode = req.InitialCode
	}
	if req.TestCases != "" {
		problem.TestCases = req.TestCases
	}
	if req.Points > 0 {
		problem.Points = req.Points
	}
	if req.TimeLimit > 0 {
		problem.TimeLimit = req.TimeLimit
	}
	if req.MemoryLimit > 0 {
		problem.MemoryLimit = req.MemoryLimit
	}
	if req.IsActive != nil {
		problem.IsActive = *req.IsActive
	}

	if err := s.db.Save(&problem).Error; err != nil {
		return nil, fmt.Errorf("ошибка обновления задачи: %w", err)
	}

	return &problem, nil
}

// DeleteProblem удаляет задачу
func (s *ProblemService) DeleteProblem(id uint) error {
	if err := s.db.Delete(&models.Problem{}, id).Error; err != nil {
		return fmt.Errorf("ошибка удаления задачи: %w", err)
	}
	return nil
}

// Request/Response structures
type CreateProblemRequest struct {
	Title       string `json:"title" binding:"required,min=2,max=100"`
	Description string `json:"description" binding:"required"`
	Difficulty  string `json:"difficulty" binding:"required,oneof=easy medium hard"`
	InitialCode string `json:"initial_code" binding:"omitempty"`
	TestCases   string `json:"test_cases" binding:"required"`
	Points      int    `json:"points" binding:"required,min=1"`
	TimeLimit   int    `json:"time_limit" binding:"omitempty,min=1"`
	MemoryLimit int    `json:"memory_limit" binding:"omitempty,min=1"`
}

type UpdateProblemRequest struct {
	Title       string `json:"title" binding:"omitempty,min=2,max=100"`
	Description string `json:"description" binding:"omitempty"`
	Difficulty  string `json:"difficulty" binding:"omitempty,oneof=easy medium hard"`
	InitialCode string `json:"initial_code" binding:"omitempty"`
	TestCases   string `json:"test_cases" binding:"omitempty"`
	Points      int    `json:"points" binding:"omitempty,min=1"`
	TimeLimit   int    `json:"time_limit" binding:"omitempty,min=1"`
	MemoryLimit int    `json:"memory_limit" binding:"omitempty,min=1"`
	IsActive    *bool  `json:"is_active"`
}

type SubmitSolutionRequest struct {
	Code string `json:"code" binding:"required"`
}

type SubmissionResult struct {
	Status        models.SubmissionStatus `json:"status"`
	Score         int                     `json:"score"`
	TestsPassed   int                     `json:"tests_passed"`
	TestsTotal    int                     `json:"tests_total"`
	ExecutionTime int                     `json:"execution_time"`
	MemoryUsed    int                     `json:"memory_used"`
	ErrorOutput   string                  `json:"error_output"`
}