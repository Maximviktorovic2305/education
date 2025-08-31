package models

import (
	"time"

	"gorm.io/gorm"
)

// UserProgress отслеживает прогресс пользователя по урокам
type UserProgress struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"user_id" gorm:"not null"`
	LessonID     uint      `json:"lesson_id" gorm:"not null"`
	IsCompleted  bool      `json:"is_completed" gorm:"default:false"`
	CompletedAt  *time.Time `json:"completed_at"`
	TimeSpent    int       `json:"time_spent" gorm:"default:0"` // в секундах
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Связи
	User   User   `json:"user,omitempty"`
	Lesson Lesson `json:"lesson,omitempty"`

	// Уникальный индекс для пары пользователь-урок
	_ struct{} `gorm:"uniqueIndex:idx_user_lesson,priority:1"`
}

// UserSubmission представляет отправку решения пользователем
type UserSubmission struct {
	ID          uint             `json:"id" gorm:"primaryKey"`
	UserID      uint             `json:"user_id" gorm:"not null"`
	ProblemID   uint             `json:"problem_id" gorm:"not null"`
	Code        string           `json:"code" gorm:"type:text"`
	Language    string           `json:"language" gorm:"default:'go'"`
	Status      SubmissionStatus `json:"status" gorm:"default:'pending'"`
	Score       int              `json:"score" gorm:"default:0"`
	TestsPassed int              `json:"tests_passed" gorm:"default:0"`
	TestsTotal  int              `json:"tests_total" gorm:"default:0"`
	ExecutionTime int            `json:"execution_time"` // в миллисекундах
	MemoryUsed  int              `json:"memory_used"`    // в байтах
	ErrorOutput string           `json:"error_output" gorm:"type:text"`
	SubmittedAt time.Time        `json:"submitted_at"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`

	// Связи
	User    User    `json:"user,omitempty"`
	Problem Problem `json:"problem,omitempty"`
}

// SubmissionStatus определяет статус отправки
type SubmissionStatus string

const (
	SubmissionStatusPending   SubmissionStatus = "pending"
	SubmissionStatusRunning   SubmissionStatus = "running"
	SubmissionStatusAccepted  SubmissionStatus = "accepted"
	SubmissionStatusWrongAnswer SubmissionStatus = "wrong_answer"
	SubmissionStatusTimeLimitExceeded SubmissionStatus = "time_limit_exceeded"
	SubmissionStatusMemoryLimitExceeded SubmissionStatus = "memory_limit_exceeded"
	SubmissionStatusRuntimeError SubmissionStatus = "runtime_error"
	SubmissionStatusCompileError SubmissionStatus = "compile_error"
)

// UserTestResult представляет результат прохождения теста
type UserTestResult struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id" gorm:"not null"`
	TestID        uint      `json:"test_id" gorm:"not null"`
	Score         int       `json:"score"`         // набранные баллы
	MaxScore      int       `json:"max_score"`     // максимальные баллы
	Percentage    float64   `json:"percentage"`    // процент правильных ответов
	IsPassed      bool      `json:"is_passed"`     // прошёл ли тест
	TimeSpent     int       `json:"time_spent"`    // время в секундах
	Answers       string    `json:"answers" gorm:"type:text"` // JSON с ответами
	StartedAt     time.Time `json:"started_at"`
	CompletedAt   *time.Time `json:"completed_at"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Связи
	User User `json:"user,omitempty"`
	Test Test `json:"test,omitempty"`
}

// Certificate представляет сертификат
type Certificate struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	UserID       uint           `json:"user_id" gorm:"not null"`
	Type         CertificateType `json:"type"`
	Title        string         `json:"title" gorm:"not null"`
	Description  string         `json:"description"`
	CertificateNumber string    `json:"certificate_number" gorm:"uniqueIndex;not null"`
	IssuedAt     time.Time      `json:"issued_at"`
	ValidUntil   *time.Time     `json:"valid_until"`
	PDFPath      string         `json:"pdf_path"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`

	// Связи
	User User `json:"user,omitempty"`
}

// CertificateType определяет тип сертификата
type CertificateType string

const (
	CertificateTypeJunior     CertificateType = "junior"
	CertificateTypeMiddle     CertificateType = "middle"
	CertificateTypeSenior     CertificateType = "senior"
	CertificateTypeCourse     CertificateType = "course"
	CertificateTypeAchievement CertificateType = "achievement"
)

// RefreshToken представляет refresh токен для аутентификации
type RefreshToken struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null"`
	Token     string    `json:"token" gorm:"uniqueIndex;not null"`
	ExpiresAt time.Time `json:"expires_at"`
	IsRevoked bool      `json:"is_revoked" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Связи
	User User `json:"user,omitempty"`
}

// BeforeDelete хук для очистки связанных данных при удалении пользователя
func (u *User) BeforeDelete(tx *gorm.DB) error {
	// Удаляем все связанные записи
	tx.Where("user_id = ?", u.ID).Delete(&UserProgress{})
	tx.Where("user_id = ?", u.ID).Delete(&UserSubmission{})
	tx.Where("user_id = ?", u.ID).Delete(&UserTestResult{})
	tx.Where("user_id = ?", u.ID).Delete(&Certificate{})
	tx.Where("user_id = ?", u.ID).Delete(&RefreshToken{})
	return nil
}