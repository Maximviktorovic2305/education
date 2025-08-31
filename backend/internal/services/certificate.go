package services

import (
	"errors"
	"fmt"
	"time"

	"go-education-platform/internal/models"
	"gorm.io/gorm"
)

type CertificateService struct {
	db *gorm.DB
}

func NewCertificateService(db *gorm.DB) *CertificateService {
	return &CertificateService{db: db}
}

// GetUserCertificates получает сертификаты пользователя
func (s *CertificateService) GetUserCertificates(userID uint) ([]models.Certificate, error) {
	var certificates []models.Certificate
	err := s.db.Where("user_id = ?", userID).
		Order("issued_at DESC").
		Find(&certificates).Error
	
	if err != nil {
		return nil, fmt.Errorf("ошибка получения сертификатов: %w", err)
	}
	
	return certificates, nil
}

// GenerateCertificate генерирует новый сертификат
func (s *CertificateService) GenerateCertificate(userID uint, req *GenerateCertificateRequest) (*models.Certificate, error) {
	// TODO: Implement certificate generation logic
	// This is a placeholder implementation
	
	certificate := &models.Certificate{
		UserID:            userID,
		Type:              models.CertificateType(req.Type),
		Title:             "Сертификат", // TODO: Generate proper title based on type
		Description:       "Сертификат о прохождении курса", // TODO: Generate proper description
		CertificateNumber: generateCertificateNumber(), // TODO: Implement proper certificate number generation
		IssuedAt:          time.Now(),
	}
	
	if err := s.db.Create(certificate).Error; err != nil {
		return nil, fmt.Errorf("ошибка создания сертификата: %w", err)
	}
	
	return certificate, nil
}

// ValidateCertificate проверяет действительность сертификата по номеру
func (s *CertificateService) ValidateCertificate(certificateNumber string) (*CertificateValidationResult, error) {
	var certificate models.Certificate
	
	err := s.db.Where("certificate_number = ?", certificateNumber).First(&certificate).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &CertificateValidationResult{
				IsValid: false,
				Error:   "Сертификат не найден",
			}, nil
		}
		return nil, fmt.Errorf("ошибка проверки сертификата: %w", err)
	}
	
	// Check if certificate has expired
	isValid := true
	var validationError string
	
	if certificate.ValidUntil != nil && time.Now().After(*certificate.ValidUntil) {
		isValid = false
		validationError = "Сертификат истёк"
	}
	
	result := &CertificateValidationResult{
		IsValid:     isValid,
		Certificate: &certificate,
		Error:       validationError,
	}
	
	return result, nil
}

// GetVerificationUrl получает URL для проверки сертификата
func (s *CertificateService) GetVerificationUrl(certificateID uint) (*VerificationUrlResponse, error) {
	var certificate models.Certificate
	
	err := s.db.Where("id = ?", certificateID).First(&certificate).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("сертификат не найден")
		}
		return nil, fmt.Errorf("ошибка получения сертификата: %w", err)
	}
	
	// TODO: Generate proper verification URL
	verificationUrl := fmt.Sprintf("https://go-education-platform.com/verify/%s", certificate.CertificateNumber)
	
	response := &VerificationUrlResponse{
		VerificationUrl: verificationUrl,
	}
	
	return response, nil
}

// CheckEligibility проверяет возможность получения сертификатов пользователем
func (s *CertificateService) CheckEligibility(userID uint) (*EligibilityResponse, error) {
	// TODO: Implement actual eligibility checking logic
	// This is a placeholder implementation
	
	eligibleCertificates := []EligibleCertificate{
		{
			Type:             "junior",
			Title:            "Junior Developer",
			Description:      "Для пользователей, набравших 500+ очков",
			RequirementsMet:  true,
			Requirements:     []string{"Набрать 500+ очков", "Завершить 10 уроков"},
		},
		{
			Type:             "middle",
			Title:            "Middle Developer",
			Description:      "Для пользователей, набравших 1500+ очков",
			RequirementsMet:  false,
			Requirements:     []string{"Набрать 1500+ очков", "Завершить 30 уроков", "Пройти 5 тестов"},
		},
	}
	
	response := &EligibilityResponse{
		EligibleCertificates: eligibleCertificates,
	}
	
	return response, nil
}

// GetCertificateByID получает сертификат по ID
func (s *CertificateService) GetCertificateByID(certificateID uint) (*models.Certificate, error) {
	var certificate models.Certificate
	
	err := s.db.Where("id = ?", certificateID).First(&certificate).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("сертификат не найден")
		}
		return nil, fmt.Errorf("ошибка получения сертификата: %w", err)
	}
	
	return &certificate, nil
}

// generateCertificateNumber генерирует уникальный номер сертификата
func generateCertificateNumber() string {
	// TODO: Implement proper certificate number generation
	// This is a placeholder implementation
	return fmt.Sprintf("CERT-%d", time.Now().Unix())
}

// GenerateCertificateRequest структура для запроса генерации сертификата
type GenerateCertificateRequest struct {
	Type      string `json:"type"`
	CourseID  *uint  `json:"course_id,omitempty"`
	AchievementID *uint  `json:"achievement_id,omitempty"`
	CustomTitle   *string `json:"custom_title,omitempty"`
}

// CertificateValidationResult структура для результата проверки сертификата
type CertificateValidationResult struct {
	IsValid     bool                  `json:"is_valid"`
	Certificate *models.Certificate   `json:"certificate,omitempty"`
	Error       string                `json:"error,omitempty"`
}

// VerificationUrlResponse структура для ответа с URL проверки сертификата
type VerificationUrlResponse struct {
	VerificationUrl string `json:"verification_url"`
}

// EligibilityResponse структура для ответа с информацией о возможности получения сертификатов
type EligibilityResponse struct {
	EligibleCertificates []EligibleCertificate `json:"eligible_certificates"`
}

// EligibleCertificate структура для информации о возможности получения сертификата
type EligibleCertificate struct {
	Type             string   `json:"type"`
	Title            string   `json:"title"`
	Description      string   `json:"description"`
	RequirementsMet  bool     `json:"requirements_met"`
	Requirements     []string `json:"requirements"`
}