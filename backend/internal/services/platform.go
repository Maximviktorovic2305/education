package services

import (
	"go-education-platform/internal/models"
	"gorm.io/gorm"
)

type PlatformService struct {
	db *gorm.DB
}

func NewPlatformService(db *gorm.DB) *PlatformService {
	return &PlatformService{
		db: db,
	}
}

// GetFeatures возвращает все активные функции платформы
func (s *PlatformService) GetFeatures() ([]models.Feature, error) {
	var features []models.Feature
	
	// Получаем все активные функции, отсортированные по порядку
	if err := s.db.Where("is_active = ?", true).Order(`"order" ASC, created_at ASC`).Find(&features).Error; err != nil {
		return nil, err
	}

	// Обновляем количество для каждой функции
	for i := range features {
		switch features[i].ID {
		case "courses":
			var count int64
			s.db.Model(&models.Course{}).Where("is_active = ?", true).Count(&count)
			features[i].Count = int(count)
		case "problems":
			var count int64
			s.db.Model(&models.Problem{}).Where("is_active = ?", true).Count(&count)
			features[i].Count = int(count)
		case "tests":
			var count int64
			s.db.Model(&models.Test{}).Where("is_active = ?", true).Count(&count)
			features[i].Count = int(count)
		case "certificates":
			var count int64
			s.db.Model(&models.Certificate{}).Count(&count)
			features[i].Count = int(count)
		}
	}

	return features, nil
}

// GetLevels возвращает все активные уровни, отсортированные по количеству очков
func (s *PlatformService) GetLevels() ([]models.Level, error) {
	var levels []models.Level
	
	if err := s.db.Where("is_active = ?", true).Order(`points ASC, "order" ASC`).Find(&levels).Error; err != nil {
		return nil, err
	}

	return levels, nil
}

// GetStats возвращает общую статистику платформы
func (s *PlatformService) GetStats() (*models.PlatformStats, error) {
	stats := &models.PlatformStats{}

	// Подсчитываем общее количество пользователей
	var totalUsers int64
	if err := s.db.Model(&models.User{}).Count(&totalUsers).Error; err != nil {
		return nil, err
	}
	stats.TotalUsers = int(totalUsers)

	// Подсчитываем общее количество уроков
	var totalLessons int64
	if err := s.db.Model(&models.Lesson{}).Where("is_active = ?", true).Count(&totalLessons).Error; err != nil {
		return nil, err
	}
	stats.TotalLessons = int(totalLessons)

	// Подсчитываем общее количество задач
	var totalProblems int64
	if err := s.db.Model(&models.Problem{}).Where("is_active = ?", true).Count(&totalProblems).Error; err != nil {
		return nil, err
	}
	stats.TotalProblems = int(totalProblems)

	// Подсчитываем общее количество тестов
	var totalTests int64
	if err := s.db.Model(&models.Test{}).Where("is_active = ?", true).Count(&totalTests).Error; err != nil {
		return nil, err
	}
	stats.TotalTests = int(totalTests)

	return stats, nil
}

// SeedDefaultFeatures создает функции платформы по умолчанию, если их нет
func (s *PlatformService) SeedDefaultFeatures() error {
	// Проверяем, есть ли уже функции в базе данных
	var count int64
	if err := s.db.Model(&models.Feature{}).Count(&count).Error; err != nil {
		return err
	}

	// Если функций нет, создаем их
	if count == 0 {
		defaultFeatures := []models.Feature{
			{
				ID:          "courses",
				Title:       "Interactive Courses",
				Description: "Learn programming through structured courses",
				Icon:        "📚",
				IsActive:    true,
				Order:       1,
			},
			{
				ID:          "problems",
				Title:       "Coding Problems",
				Description: "Practice with hands-on coding challenges",
				Icon:        "💻",
				IsActive:    true,
				Order:       2,
			},
			{
				ID:          "tests",
				Title:       "Knowledge Tests",
				Description: "Verify your understanding with quizzes",
				Icon:        "📝",
				IsActive:    true,
				Order:       3,
			},
			{
				ID:          "certificates",
				Title:       "Certificates",
				Description: "Earn certificates for completed courses",
				Icon:        "🏆",
				IsActive:    true,
				Order:       4,
			},
		}

		if err := s.db.Create(&defaultFeatures).Error; err != nil {
			return err
		}
	}

	return nil
}

// SeedDefaultLevels создает уровни по умолчанию, если их нет
func (s *PlatformService) SeedDefaultLevels() error {
	// Проверяем, есть ли уже уровни в базе данных
	var count int64
	if err := s.db.Model(&models.Level{}).Count(&count).Error; err != nil {
		return err
	}

	// Если уровней нет, создаем их
	if count == 0 {
		defaultLevels := []models.Level{
			{
				ID:          "junior",
				Name:        "Junior Developer",
				Points:      0,
				Color:       "#4CAF50",
				Description: "Starting your programming journey",
				IsActive:    true,
				Order:       1,
			},
			{
				ID:          "middle",
				Name:        "Middle Developer",
				Points:      1000,
				Color:       "#FF9800",
				Description: "Building solid programming skills",
				IsActive:    true,
				Order:       2,
			},
			{
				ID:          "senior",
				Name:        "Senior Developer",
				Points:      2000,
				Color:       "#F44336",
				Description: "Mastering advanced concepts",
				IsActive:    true,
				Order:       3,
			},
		}

		if err := s.db.Create(&defaultLevels).Error; err != nil {
			return err
		}
	}

	return nil
}