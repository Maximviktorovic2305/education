package services

import (
	"errors"
	"fmt"

	"go-education-platform/internal/models"

	"gorm.io/gorm"
)

type CourseService struct {
	db *gorm.DB
}

func NewCourseService(db *gorm.DB) *CourseService {
	return &CourseService{db: db}
}

// GetCourses получает список всех активных курсов
func (s *CourseService) GetCourses() ([]*models.Course, error) {
	var courses []*models.Course
	if err := s.db.Where("is_active = ?", true).
		Order("\"order\" ASC").
		Find(&courses).Error; err != nil {
		return nil, fmt.Errorf("ошибка получения курсов: %w", err)
	}
	return courses, nil
}

// GetCourseByID получает курс по ID
func (s *CourseService) GetCourseByID(id uint) (*models.Course, error) {
	var course models.Course
	if err := s.db.Where("is_active = ?", true).
		First(&course, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("курс не найден")
		}
		return nil, fmt.Errorf("ошибка получения курса: %w", err)
	}
	return &course, nil
}

// GetCourseSections получает разделы курса
func (s *CourseService) GetCourseSections(courseID uint) ([]*models.Section, error) {
	var sections []*models.Section
	if err := s.db.Where("course_id = ? AND is_active = ?", courseID, true).
		Order("\"order\" ASC").
		Preload("Lessons", func(db *gorm.DB) *gorm.DB {
			return db.Where("is_active = ?", true).Order("\"order\" ASC")
		}).
		Find(&sections).Error; err != nil {
		return nil, fmt.Errorf("ошибка получения разделов курса: %w", err)
	}
	return sections, nil
}

// GetLessonByID получает урок по ID
func (s *CourseService) GetLessonByID(id uint) (*models.Lesson, error) {
	var lesson models.Lesson
	if err := s.db.Where("is_active = ?", true).
		Preload("Section").
		First(&lesson, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("урок не найден")
		}
		return nil, fmt.Errorf("ошибка получения урока: %w", err)
	}
	return &lesson, nil
}

// Admin methods

// CreateCourse создает новый курс
func (s *CourseService) CreateCourse(req *CreateCourseRequest) (*models.Course, error) {
	course := &models.Course{
		Title:       req.Title,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		Order:       req.Order,
		IsActive:    true,
	}

	if err := s.db.Create(course).Error; err != nil {
		return nil, fmt.Errorf("ошибка создания курса: %w", err)
	}

	return course, nil
}

// UpdateCourse обновляет курс
func (s *CourseService) UpdateCourse(id uint, req *UpdateCourseRequest) (*models.Course, error) {
	var course models.Course
	if err := s.db.First(&course, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("курс не найден")
		}
		return nil, fmt.Errorf("ошибка получения курса: %w", err)
	}

	// Обновляем поля
	if req.Title != "" {
		course.Title = req.Title
	}
	if req.Description != "" {
		course.Description = req.Description
	}
	if req.ImageURL != "" {
		course.ImageURL = req.ImageURL
	}
	if req.Order >= 0 {
		course.Order = req.Order
	}
	if req.IsActive != nil {
		course.IsActive = *req.IsActive
	}

	if err := s.db.Save(&course).Error; err != nil {
		return nil, fmt.Errorf("ошибка обновления курса: %w", err)
	}

	return &course, nil
}

// DeleteCourse удаляет курс
func (s *CourseService) DeleteCourse(id uint) error {
	if err := s.db.Delete(&models.Course{}, id).Error; err != nil {
		return fmt.Errorf("ошибка удаления курса: %w", err)
	}
	return nil
}

// CreateSection создает новый раздел
func (s *CourseService) CreateSection(req *CreateSectionRequest) (*models.Section, error) {
	section := &models.Section{
		CourseID:    req.CourseID,
		Title:       req.Title,
		Description: req.Description,
		Order:       req.Order,
		IsActive:    true,
	}

	if err := s.db.Create(section).Error; err != nil {
		return nil, fmt.Errorf("ошибка создания раздела: %w", err)
	}

	return section, nil
}

// UpdateSection обновляет раздел
func (s *CourseService) UpdateSection(id uint, req *UpdateSectionRequest) (*models.Section, error) {
	var section models.Section
	if err := s.db.First(&section, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("раздел не найден")
		}
		return nil, fmt.Errorf("ошибка получения раздела: %w", err)
	}

	// Обновляем поля
	if req.Title != "" {
		section.Title = req.Title
	}
	if req.Description != "" {
		section.Description = req.Description
	}
	if req.Order >= 0 {
		section.Order = req.Order
	}
	if req.IsActive != nil {
		section.IsActive = *req.IsActive
	}

	if err := s.db.Save(&section).Error; err != nil {
		return nil, fmt.Errorf("ошибка обновления раздела: %w", err)
	}

	return &section, nil
}

// DeleteSection удаляет раздел
func (s *CourseService) DeleteSection(id uint) error {
	if err := s.db.Delete(&models.Section{}, id).Error; err != nil {
		return fmt.Errorf("ошибка удаления раздела: %w", err)
	}
	return nil
}

// CreateLesson создает новый урок
func (s *CourseService) CreateLesson(req *CreateLessonRequest) (*models.Lesson, error) {
	lesson := &models.Lesson{
		SectionID:   req.SectionID,
		Title:       req.Title,
		Content:     req.Content,
		CodeExample: req.CodeExample,
		Order:       req.Order,
		Points:      req.Points,
		IsActive:    true,
	}

	if err := s.db.Create(lesson).Error; err != nil {
		return nil, fmt.Errorf("ошибка создания урока: %w", err)
	}

	return lesson, nil
}

// UpdateLesson обновляет урок
func (s *CourseService) UpdateLesson(id uint, req *UpdateLessonRequest) (*models.Lesson, error) {
	var lesson models.Lesson
	if err := s.db.First(&lesson, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("урок не найден")
		}
		return nil, fmt.Errorf("ошибка получения урока: %w", err)
	}

	// Обновляем поля
	if req.Title != "" {
		lesson.Title = req.Title
	}
	if req.Content != "" {
		lesson.Content = req.Content
	}
	if req.CodeExample != "" {
		lesson.CodeExample = req.CodeExample
	}
	if req.Order >= 0 {
		lesson.Order = req.Order
	}
	if req.Points > 0 {
		lesson.Points = req.Points
	}
	if req.IsActive != nil {
		lesson.IsActive = *req.IsActive
	}

	if err := s.db.Save(&lesson).Error; err != nil {
		return nil, fmt.Errorf("ошибка обновления урока: %w", err)
	}

	return &lesson, nil
}

// DeleteLesson удаляет урок
func (s *CourseService) DeleteLesson(id uint) error {
	if err := s.db.Delete(&models.Lesson{}, id).Error; err != nil {
		return fmt.Errorf("ошибка удаления урока: %w", err)
	}
	return nil
}

// Request structures
type CreateCourseRequest struct {
	Title       string `json:"title" binding:"required,min=2,max=100"`
	Description string `json:"description" binding:"omitempty,max=500"`
	ImageURL    string `json:"image_url" binding:"omitempty,url"`
	Order       int    `json:"order" binding:"omitempty,min=0"`
}

type UpdateCourseRequest struct {
	Title       string `json:"title" binding:"omitempty,min=2,max=100"`
	Description string `json:"description" binding:"omitempty,max=500"`
	ImageURL    string `json:"image_url" binding:"omitempty,url"`
	Order       int    `json:"order" binding:"omitempty,min=0"`
	IsActive    *bool  `json:"is_active"`
}

type CreateSectionRequest struct {
	CourseID    uint   `json:"course_id" binding:"required"`
	Title       string `json:"title" binding:"required,min=2,max=100"`
	Description string `json:"description" binding:"omitempty,max=500"`
	Order       int    `json:"order" binding:"omitempty,min=0"`
}

type UpdateSectionRequest struct {
	Title       string `json:"title" binding:"omitempty,min=2,max=100"`
	Description string `json:"description" binding:"omitempty,max=500"`
	Order       int    `json:"order" binding:"omitempty,min=0"`
	IsActive    *bool  `json:"is_active"`
}

type CreateLessonRequest struct {
	SectionID   uint   `json:"section_id" binding:"required"`
	Title       string `json:"title" binding:"required,min=2,max=100"`
	Content     string `json:"content" binding:"required"`
	CodeExample string `json:"code_example" binding:"omitempty"`
	Order       int    `json:"order" binding:"omitempty,min=0"`
	Points      int    `json:"points" binding:"omitempty,min=1"`
}

type UpdateLessonRequest struct {
	Title       string `json:"title" binding:"omitempty,min=2,max=100"`
	Content     string `json:"content" binding:"omitempty"`
	CodeExample string `json:"code_example" binding:"omitempty"`
	Order       int    `json:"order" binding:"omitempty,min=0"`
	Points      int    `json:"points" binding:"omitempty,min=1"`
	IsActive    *bool  `json:"is_active"`
}