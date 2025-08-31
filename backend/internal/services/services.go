package services

import (
	"errors"
	"fmt"

	"go-education-platform/internal/middleware"
	"go-education-platform/internal/models"
	"go-education-platform/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// GetUserByID получает пользователя по ID
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("пользователь не найден")
		}
		return nil, fmt.Errorf("ошибка получения пользователя: %w", err)
	}
	return &user, nil
}

// UpdateUserProfile обновляет профиль пользователя
func (s *UserService) UpdateUserProfile(userID uint, req *UpdateProfileRequest) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, errors.New("пользователь не найден")
	}

	// Обновляем поля
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	if err := s.db.Save(&user).Error; err != nil {
		return nil, fmt.Errorf("ошибка обновления профиля: %w", err)
	}

	// Очищаем пароль
	user.Password = ""
	return &user, nil
}

// ChangePassword изменяет пароль пользователя
func (s *UserService) ChangePassword(userID uint, req *ChangePasswordRequest) error {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return errors.New("пользователь не найден")
	}

	// Проверяем старый пароль
	if err := utils.CheckPassword(user.Password, req.OldPassword); err != nil {
		return errors.New("неверный текущий пароль")
	}

	// Хешируем новый пароль
	newPasswordHash, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("ошибка хеширования пароля: %w", err)
	}

	// Обновляем пароль
	user.Password = newPasswordHash
	if err := s.db.Save(&user).Error; err != nil {
		return fmt.Errorf("ошибка обновления пароля: %w", err)
	}

	return nil
}

// GetUsers получает список пользователей (только для админов)
func (s *UserService) GetUsers(page, limit int) ([]*models.User, int64, error) {
	var users []*models.User
	var total int64

	// Подсчитываем общее количество
	s.db.Model(&models.User{}).Count(&total)

	// Получаем пользователей с пагинацией
	offset := (page - 1) * limit
	if err := s.db.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return nil, 0, fmt.Errorf("ошибка получения пользователей: %w", err)
	}

	// Очищаем пароли
	for _, user := range users {
		user.Password = ""
	}

	return users, total, nil
}

// UpdateUser обновляет пользователя (только для админов)
func (s *UserService) UpdateUser(userID uint, req *UpdateUserRequest) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, errors.New("пользователь не найден")
	}

	// Обновляем поля
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Email != "" {
		// Проверяем уникальность email
		var existingUser models.User
		if err := s.db.Where("email = ? AND id != ?", req.Email, userID).First(&existingUser).Error; err == nil {
			return nil, errors.New("пользователь с таким email уже существует")
		}
		user.Email = req.Email
	}
	if req.Role != "" {
		user.Role = models.UserRole(req.Role)
	}
	if req.Level != "" {
		user.Level = models.UserLevel(req.Level)
	}
	if req.Points >= 0 {
		user.Points = req.Points
	}

	if err := s.db.Save(&user).Error; err != nil {
		return nil, fmt.Errorf("ошибка обновления пользователя: %w", err)
	}

	user.Password = ""
	return &user, nil
}

// DeleteUser удаляет пользователя (только для админов)
func (s *UserService) DeleteUser(userID uint) error {
	if err := s.db.Delete(&models.User{}, userID).Error; err != nil {
		return fmt.Errorf("ошибка удаления пользователя: %w", err)
	}
	return nil
}

// Request structures
type UpdateProfileRequest struct {
	Name   string `json:"name" binding:"omitempty,min=2,max=50"`
	Avatar string `json:"avatar" binding:"omitempty,url"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

type UpdateUserRequest struct {
	Name   string `json:"name" binding:"omitempty,min=2,max=50"`
	Email  string `json:"email" binding:"omitempty,email"`
	Role   string `json:"role" binding:"omitempty,oneof=user admin"`
	Level  string `json:"level" binding:"omitempty,oneof=junior middle senior"`
	Points int    `json:"points" binding:"omitempty,min=0"`
}

// GetUserFromContext получает пользователя из контекста
func GetUserFromContext(c *gin.Context) (*models.User, error) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		return nil, errors.New("пользователь не авторизован")
	}

	// Здесь можно добавить кеширование
	db := c.MustGet("db").(*gorm.DB)
	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		return nil, errors.New("пользователь не найден")
	}

	user.Password = ""
	return &user, nil
}

type TestService struct {
	db *gorm.DB
}

func NewTestService(db *gorm.DB) *TestService {
	return &TestService{db: db}
}

type ProgressService struct {
	db *gorm.DB
}

func NewProgressService(db *gorm.DB) *ProgressService {
	return &ProgressService{db: db}
}

type CertificateService struct {
	db *gorm.DB
}

func NewCertificateService(db *gorm.DB) *CertificateService {
	return &CertificateService{db: db}
}

