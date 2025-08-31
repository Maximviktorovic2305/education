package services

import (
	"errors"
	"fmt"
	"log"
	"time"

	"go-education-platform/internal/config"
	"go-education-platform/internal/models"
	"go-education-platform/internal/utils"

	"gorm.io/gorm"
)

type AuthService struct {
	db       *gorm.DB
	jwtUtils *utils.JWTUtils
	config   *config.Config
}

func NewAuthService(db *gorm.DB, cfg *config.Config) *AuthService {
	return &AuthService{
		db:       db,
		jwtUtils: utils.NewJWTUtils(cfg.JWT.Secret),
		config:   cfg,
	}
}

// RegisterRequest структура запроса регистрации
type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginRequest структура запроса входа
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse структура ответа аутентификации
type AuthResponse struct {
	User         *models.User `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
}

// RefreshRequest структура запроса обновления токена
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Register регистрирует нового пользователя
func (s *AuthService) Register(req *RegisterRequest) (*AuthResponse, error) {
	// Проверяем, существует ли пользователь с таким email
	var existingUser models.User
	if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("пользователь с таким email уже существует")
	}

	// Хешируем пароль
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("ошибка хеширования пароля: %w", err)
	}

	// Создаём нового пользователя
	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     models.UserRoleUser,
		Level:    models.UserLevelJunior,
		Points:   0,
	}

	if err := s.db.Create(user).Error; err != nil {
		return nil, fmt.Errorf("ошибка создания пользователя: %w", err)
	}

	// Генерируем токены
	return s.generateTokens(user)
}

// Login аутентифицирует пользователя
func (s *AuthService) Login(req *LoginRequest) (*AuthResponse, error) {
	// Ищем пользователя по email
	var user models.User
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("неверный email или пароль")
		}
		return nil, fmt.Errorf("ошибка поиска пользователя: %w", err)
	}

	// Проверяем пароль
	if err := utils.CheckPassword(user.Password, req.Password); err != nil {
		return nil, errors.New("неверный email или пароль")
	}

	// Генерируем токены
	return s.generateTokens(&user)
}

// RefreshToken обновляет access токен
func (s *AuthService) RefreshToken(req *RefreshRequest) (*AuthResponse, error) {
	// Парсим refresh токен
	claims, err := s.jwtUtils.ParseToken(req.RefreshToken)
	if err != nil {
		return nil, errors.New("недействительный refresh токен")
	}

	// Проверяем, что это именно refresh токен
	if claims.Role != "refresh" {
		return nil, errors.New("недействительный refresh токен")
	}

	// Проверяем, существует ли токен в базе данных и не отозван ли он
	var refreshToken models.RefreshToken
	if err := s.db.Where("token = ? AND user_id = ? AND is_revoked = false AND expires_at > ?",
		req.RefreshToken, claims.UserID, time.Now()).First(&refreshToken).Error; err != nil {
		return nil, errors.New("refresh токен недействителен или истёк")
	}

	// Получаем актуальные данные пользователя
	var user models.User
	if err := s.db.First(&user, claims.UserID).Error; err != nil {
		return nil, errors.New("пользователь не найден")
	}

	// Отзываем старый refresh токен
	refreshToken.IsRevoked = true
	s.db.Save(&refreshToken)

	// Генерируем новые токены
	return s.generateTokens(&user)
}

// Logout отзывает refresh токен
func (s *AuthService) Logout(refreshToken string) error {
	return s.db.Model(&models.RefreshToken{}).
		Where("token = ?", refreshToken).
		Update("is_revoked", true).Error
}

// generateTokens генерирует access и refresh токены
func (s *AuthService) generateTokens(user *models.User) (*AuthResponse, error) {
	// Парсим продолжительность токенов
	accessDuration, err := time.ParseDuration(s.config.JWT.AccessExpiry)
	if err != nil {
		accessDuration = 15 * time.Minute
		log.Printf("Ошибка парсинга JWT_ACCESS_EXPIRY, используется значение по умолчанию: %v", accessDuration)
	}

	refreshDuration, err := time.ParseDuration(s.config.JWT.RefreshExpiry)
	if err != nil {
		refreshDuration = 7 * 24 * time.Hour
		log.Printf("Ошибка парсинга JWT_REFRESH_EXPIRY, используется значение по умолчанию: %v", refreshDuration)
	}

	// Генерируем access токен
	accessToken, err := s.jwtUtils.GenerateToken(user.ID, user.Email, string(user.Role), accessDuration)
	if err != nil {
		return nil, fmt.Errorf("ошибка генерации access токена: %w", err)
	}

	// Генерируем refresh токен
	refreshTokenString, err := s.jwtUtils.GenerateRefreshToken(user.ID, user.Email, refreshDuration)
	if err != nil {
		return nil, fmt.Errorf("ошибка генерации refresh токена: %w", err)
	}

	// Сохраняем refresh токен в базе данных
	refreshTokenModel := &models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshTokenString,
		ExpiresAt: time.Now().Add(refreshDuration),
		IsRevoked: false,
	}

	if err := s.db.Create(refreshTokenModel).Error; err != nil {
		return nil, fmt.Errorf("ошибка сохранения refresh токена: %w", err)
	}

	// Очищаем пароль из ответа
	user.Password = ""

	return &AuthResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshTokenString,
	}, nil
}

// CleanupExpiredTokens удаляет истёкшие refresh токены
func (s *AuthService) CleanupExpiredTokens() error {
	return s.db.Where("expires_at < ? OR is_revoked = true", time.Now()).Delete(&models.RefreshToken{}).Error
}