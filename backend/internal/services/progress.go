package services

import (
	"errors"
	"fmt"
	"time"

	"go-education-platform/internal/models"
	"gorm.io/gorm"
)

type ProgressService struct {
	db *gorm.DB
}

func NewProgressService(db *gorm.DB) *ProgressService {
	return &ProgressService{db: db}
}

// GetUserProgress получает прогресс пользователя по урокам
func (s *ProgressService) GetUserProgress(userID uint) ([]models.UserProgress, error) {
	var progress []models.UserProgress
	err := s.db.Where("user_id = ?", userID).
		Preload("Lesson").
		Order("created_at DESC").
		Find(&progress).Error
	
	if err != nil {
		return nil, fmt.Errorf("ошибка получения прогресса: %w", err)
	}
	
	return progress, nil
}

// GetUserStatistics получает статистику пользователя
func (s *ProgressService) GetUserStatistics(userID uint) (*UserStatsResponse, error) {
	var stats UserStatsResponse
	
	// Получаем базовую информацию о пользователе
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, errors.New("пользователь не найден")
	}
	
	stats.TotalPoints = user.Points
	stats.CurrentLevel = string(user.Level)
	
	// Подсчитываем завершённые уроки
	var completedLessons int64
	s.db.Model(&models.UserProgress{}).
		Where("user_id = ? AND is_completed = ?", userID, true).
		Count(&completedLessons)
	stats.CompletedLessons = int(completedLessons)
	
	// Подсчитываем общее количество уроков
	var totalLessons int64
	s.db.Model(&models.Lesson{}).Where("is_active = ?", true).Count(&totalLessons)
	stats.TotalLessons = int(totalLessons)
	
	// Подсчитываем решённые задачи
	var solvedProblems int64
	s.db.Model(&models.UserSubmission{}).
		Where("user_id = ? AND status = ?", userID, "accepted").
		Distinct("problem_id").
		Count(&solvedProblems)
	stats.SolvedProblems = int(solvedProblems)
	
	// Общее количество задач
	var totalProblems int64
	s.db.Model(&models.Problem{}).Where("is_active = ?", true).Count(&totalProblems)
	stats.TotalProblems = int(totalProblems)
	
	// Пройденные тесты
	var passedTests int64
	s.db.Model(&models.UserTestResult{}).
		Where("user_id = ? AND is_passed = ?", userID, true).
		Count(&passedTests)
	stats.PassedTests = int(passedTests)
	
	// Общее количество тестов
	var totalTests int64
	s.db.Model(&models.Test{}).Where("is_active = ?", true).Count(&totalTests)
	stats.TotalTests = int(totalTests)
	
	return &stats, nil
}

// CompleteLesson отмечает урок как завершённый
func (s *ProgressService) CompleteLesson(userID, lessonID uint) (*models.UserProgress, error) {
	var progress models.UserProgress
	
	// Проверяем, существует ли урок
	var lesson models.Lesson
	if err := s.db.Where("id = ? AND is_active = ?", lessonID, true).First(&lesson).Error; err != nil {
		return nil, errors.New("урок не найден")
	}
	
	// Проверяем, есть ли уже прогресс по этому уроку
	err := s.db.Where("user_id = ? AND lesson_id = ?", userID, lessonID).First(&progress).Error
	
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("ошибка получения прогресса: %w", err)
	}
	
	// Если прогресс не найден, создаём новый
	if errors.Is(err, gorm.ErrRecordNotFound) {
		now := time.Now()
		progress = models.UserProgress{
			UserID:      userID,
			LessonID:    lessonID,
			IsCompleted: true,
			CompletedAt: &now,
			TimeSpent:   0, // Можно добавить логику отслеживания времени
		}
		
		if err := s.db.Create(&progress).Error; err != nil {
			return nil, fmt.Errorf("ошибка создания прогресса: %w", err)
		}
	} else {
		// Обновляем существующий прогресс
		if !progress.IsCompleted {
			now := time.Now()
			progress.IsCompleted = true
			progress.CompletedAt = &now
			
			if err := s.db.Save(&progress).Error; err != nil {
				return nil, fmt.Errorf("ошибка обновления прогресса: %w", err)
			}
		}
	}
	
	return &progress, nil
}

// UserStatsResponse структура для ответа со статистикой
type UserStatsResponse struct {
	TotalPoints      int    `json:"total_points"`
	CompletedLessons int    `json:"completed_lessons"`
	TotalLessons     int    `json:"total_lessons"`
	SolvedProblems   int    `json:"solved_problems"`
	TotalProblems    int    `json:"total_problems"`
	PassedTests      int    `json:"passed_tests"`
	TotalTests       int    `json:"total_tests"`
	CurrentLevel     string `json:"current_level"`
}

// GetLevelSystem получает данные системы уровней пользователя
func (s *ProgressService) GetLevelSystem(userID uint) (*LevelSystemData, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, errors.New("пользователь не найден")
	}
	
	// Calculate next level points
	nextLevelPoints := s.calculateNextLevelPoints(user.Level)
	
	// Calculate level progress percentage
	progressPercentage := 0.0
	if nextLevelPoints > 0 {
		progressPercentage = float64(user.Points) / float64(nextLevelPoints) * 100
	}
	
	levelSystem := &LevelSystemData{
		CurrentLevel:           string(user.Level),
		CurrentPoints:          user.Points,
		NextLevelPoints:        nextLevelPoints,
		LevelProgressPercentage: progressPercentage,
		Achievements:           []Achievement{}, // TODO: Implement achievements
	}
	
	return levelSystem, nil
}

// calculateNextLevelPoints вычисляет количество очков, необходимых для следующего уровня
func (s *ProgressService) calculateNextLevelPoints(currentLevel models.UserLevel) int {
	switch currentLevel {
	case models.UserLevelJunior:
		return 1000
	case models.UserLevelMiddle:
		return 3000
	case models.UserLevelSenior:
		return 0 // Senior is the highest level
	default:
		return 500 // Default for new users
	}
}

// GetLearningStreak получает информацию о серии обучения пользователя
func (s *ProgressService) GetLearningStreak(userID uint) (*LearningStreak, error) {
	// TODO: Implement actual streak calculation based on user activity
	streak := &LearningStreak{
		CurrentStreak:     0,
		LongestStreak:     0,
		LastActivityDate:  time.Now().Format("2006-01-02"),
		StreakMaintained:  true,
	}
	
	return streak, nil
}

// GetSkillProgress получает прогресс по навыкам пользователя
func (s *ProgressService) GetSkillProgress(userID uint) ([]SkillProgress, error) {
	// TODO: Implement actual skill progress calculation
	skills := []SkillProgress{
		{
			SkillName:          "Go Programming",
			Level:              1,
			ProgressPercentage: 25.0,
			TotalExercises:     20,
			CompletedExercises: 5,
		},
		{
			SkillName:          "Data Structures",
			Level:              0,
			ProgressPercentage: 10.0,
			TotalExercises:     30,
			CompletedExercises: 3,
		},
	}
	
	return skills, nil
}

// GetLessonProgress получает детальный прогресс по урокам
func (s *ProgressService) GetLessonProgress(userID uint, page, limit int, filters map[string]interface{}) (*PaginatedLessonProgress, error) {
	var progress []models.UserProgress
	var total int64
	
	query := s.db.Where("user_id = ?", userID).Preload("Lesson")
	
	// Apply filters if provided
	if courseID, ok := filters["course_id"]; ok {
		query = query.Joins("JOIN lessons ON user_progress.lesson_id = lessons.id").
			Where("lessons.course_id = ?", courseID)
	}
	
	// Get total count
	query.Model(&models.UserProgress{}).Count(&total)
	
	// Get paginated results
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).
		Order("created_at DESC").
		Find(&progress).Error
	
	if err != nil {
		return nil, fmt.Errorf("ошибка получения прогресса по урокам: %w", err)
	}
	
	result := &PaginatedLessonProgress{
		Data:       progress,
		Total:      int(total),
		Page:       page,
		Limit:      limit,
		TotalPages: (int(total) + limit - 1) / limit,
	}
	
	return result, nil
}

// UpdateLessonProgress обновляет прогресс по уроку
func (s *ProgressService) UpdateLessonProgress(userID, lessonID uint, timeSpent int) (*models.UserProgress, error) {
	var progress models.UserProgress
	
	// Проверяем, существует ли урок
	var lesson models.Lesson
	if err := s.db.Where("id = ? AND is_active = ?", lessonID, true).First(&lesson).Error; err != nil {
		return nil, errors.New("урок не найден")
	}
	
	// Проверяем, есть ли уже прогресс по этому уроку
	err := s.db.Where("user_id = ? AND lesson_id = ?", userID, lessonID).First(&progress).Error
	
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("ошибка получения прогресса: %w", err)
	}
	
	// Если прогресс не найден, создаём новый
	if errors.Is(err, gorm.ErrRecordNotFound) {
		progress = models.UserProgress{
			UserID:     userID,
			LessonID:   lessonID,
			TimeSpent:  timeSpent,
		}
		
		if err := s.db.Create(&progress).Error; err != nil {
			return nil, fmt.Errorf("ошибка создания прогресса: %w", err)
		}
	} else {
		// Обновляем существующий прогресс
		progress.TimeSpent += timeSpent
		
		if err := s.db.Save(&progress).Error; err != nil {
			return nil, fmt.Errorf("ошибка обновления прогресса: %w", err)
		}
	}
	
	return &progress, nil
}

// GetWeeklyActivity получает данные о недельной активности пользователя
func (s *ProgressService) GetWeeklyActivity(userID uint) (*WeeklyActivityData, error) {
	// TODO: Implement actual weekly activity calculation
	weekData := make([]DailyActivity, 7)
	
	// Generate mock data for the past 7 days
	for i := 0; i < 7; i++ {
		date := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
		weekData[i] = DailyActivity{
			Date:             date,
			LessonsCompleted: 1,
			ProblemsSolved:   2,
			TestsPassed:      0,
			TimeSpent:        45, // minutes
		}
	}
	
	activity := &WeeklyActivityData{
		WeekData: weekData,
	}
	
	return activity, nil
}

// GetMonthlyProgress получает данные о ежемесячном прогрессе пользователя
func (s *ProgressService) GetMonthlyProgress(userID uint) (*MonthlyProgressData, error) {
	// TODO: Implement actual monthly progress calculation
	monthData := make([]MonthlyData, 3)
	
	// Generate mock data for the past 3 months
	for i := 0; i < 3; i++ {
		month := time.Now().AddDate(0, -i, 0).Format("2006-01")
		monthData[i] = MonthlyData{
			Month:             month,
			TotalPoints:       150,
			LessonsCompleted:  5,
			ProblemsSolved:    12,
			TestsPassed:       1,
		}
	}
	
	progress := &MonthlyProgressData{
		MonthlyData: monthData,
	}
	
	return progress, nil
}

// LevelSystemData структура для данных системы уровней
type LevelSystemData struct {
	CurrentLevel           string        `json:"current_level"`
	CurrentPoints          int           `json:"current_points"`
	NextLevelPoints        int           `json:"next_level_points"`
	LevelProgressPercentage float64      `json:"level_progress_percentage"`
	Achievements           []Achievement `json:"achievements"`
}

// Achievement структура для достижений
type Achievement struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	Points      int       `json:"points"`
	UnlockedAt  time.Time `json:"unlocked_at,omitempty"`
	IsUnlocked  bool      `json:"is_unlocked"`
}

// LearningStreak структура для серии обучения
type LearningStreak struct {
	CurrentStreak     int    `json:"current_streak"`
	LongestStreak     int    `json:"longest_streak"`
	LastActivityDate  string `json:"last_activity_date"`
	StreakMaintained  bool   `json:"streak_maintained"`
}

// SkillProgress структура для прогресса по навыкам
type SkillProgress struct {
	SkillName          string  `json:"skill_name"`
	Level              int     `json:"level"`
	ProgressPercentage float64 `json:"progress_percentage"`
	TotalExercises     int     `json:"total_exercises"`
	CompletedExercises int     `json:"completed_exercises"`
}

// PaginatedLessonProgress структура для пагинированного прогресса по урокам
type PaginatedLessonProgress struct {
	Data       []models.UserProgress `json:"data"`
	Total      int                   `json:"total"`
	Page       int                   `json:"page"`
	Limit      int                   `json:"limit"`
	TotalPages int                   `json:"total_pages"`
}

// WeeklyActivityData структура для данных недельной активности
type WeeklyActivityData struct {
	WeekData []DailyActivity `json:"week_data"`
}

// DailyActivity структура для данных дневной активности
type DailyActivity struct {
	Date             string `json:"date"`
	LessonsCompleted int    `json:"lessons_completed"`
	ProblemsSolved   int    `json:"problems_solved"`
	TestsPassed      int    `json:"tests_passed"`
	TimeSpent        int    `json:"time_spent"` // in minutes
}

// MonthlyProgressData структура для данных ежемесячного прогресса
type MonthlyProgressData struct {
	MonthlyData []MonthlyData `json:"monthly_data"`
}

// MonthlyData структура для данных месячного прогресса
type MonthlyData struct {
	Month             string `json:"month"`
	TotalPoints       int    `json:"total_points"`
	LessonsCompleted  int    `json:"lessons_completed"`
	ProblemsSolved    int    `json:"problems_solved"`
	TestsPassed       int    `json:"tests_passed"`
}