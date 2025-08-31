package models

import (
	"time"
)

// User представляет пользователя системы
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"` // Скрыто из JSON
	Role      UserRole  `json:"role" gorm:"default:'user'"`
	Level     UserLevel `json:"level" gorm:"default:'junior'"`
	Points    int       `json:"points" gorm:"default:0"`
	Avatar    string    `json:"avatar"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Связи
	Progress     []UserProgress     `json:"progress,omitempty" gorm:"foreignKey:UserID"`
	Submissions  []UserSubmission   `json:"submissions,omitempty" gorm:"foreignKey:UserID"`
	TestResults  []UserTestResult   `json:"test_results,omitempty" gorm:"foreignKey:UserID"`
	Certificates []Certificate      `json:"certificates,omitempty" gorm:"foreignKey:UserID"`
	RefreshTokens []RefreshToken    `json:"-" gorm:"foreignKey:UserID"`
}

// UserRole определяет роль пользователя
type UserRole string

const (
	UserRoleUser  UserRole = "user"
	UserRoleAdmin UserRole = "admin"
)

// UserLevel определяет уровень пользователя
type UserLevel string

const (
	UserLevelJunior UserLevel = "junior"
	UserLevelMiddle UserLevel = "middle"
	UserLevelSenior UserLevel = "senior"
)

// Course представляет курс
type Course struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	Order       int       `json:"order" gorm:"default:0"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Связи
	Sections []Section `json:"sections,omitempty" gorm:"foreignKey:CourseID"`
}

// Section представляет раздел курса
type Section struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CourseID    uint      `json:"course_id" gorm:"not null"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	Order       int       `json:"order" gorm:"default:0"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Связи
	Course  Course   `json:"course,omitempty" gorm:"foreignKey:CourseID"`
	Lessons []Lesson `json:"lessons,omitempty" gorm:"foreignKey:SectionID"`
}

// Lesson представляет урок
type Lesson struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	SectionID   uint      `json:"section_id" gorm:"not null"`
	Title       string    `json:"title" gorm:"not null"`
	Content     string    `json:"content" gorm:"type:text"`
	CodeExample string    `json:"code_example" gorm:"type:text"`
	Order       int       `json:"order" gorm:"default:0"`
	Points      int       `json:"points" gorm:"default:10"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Связи
	Section  Section        `json:"section,omitempty" gorm:"foreignKey:SectionID"`
	Progress []UserProgress `json:"progress,omitempty" gorm:"foreignKey:LessonID"`
}

// Problem представляет практическую задачу
type Problem struct {
	ID           uint            `json:"id" gorm:"primaryKey"`
	Title        string          `json:"title" gorm:"not null"`
	Description  string          `json:"description" gorm:"type:text"`
	Difficulty   ProblemLevel    `json:"difficulty" gorm:"default:'easy'"`
	InitialCode  string          `json:"initial_code" gorm:"type:text"`
	TestCases    string          `json:"test_cases" gorm:"type:text"` // JSON строка с тест-кейсами
	Points       int             `json:"points" gorm:"default:20"`
	TimeLimit    int             `json:"time_limit" gorm:"default:5"` // в секундах
	MemoryLimit  int             `json:"memory_limit" gorm:"default:128"` // в MB
	IsActive     bool            `json:"is_active" gorm:"default:true"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`

	// Связи
	Submissions []UserSubmission `json:"submissions,omitempty" gorm:"foreignKey:ProblemID"`
}

// ProblemLevel определяет сложность задачи
type ProblemLevel string

const (
	ProblemLevelEasy   ProblemLevel = "easy"
	ProblemLevelMedium ProblemLevel = "medium"
	ProblemLevelHard   ProblemLevel = "hard"
)

// Test представляет тест
type Test struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	TimeLimit   int       `json:"time_limit" gorm:"default:30"` // в минутах
	PassScore   int       `json:"pass_score" gorm:"default:70"` // процент для прохождения
	Points      int       `json:"points" gorm:"default:50"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Связи
	Questions []TestQuestion   `json:"questions,omitempty" gorm:"foreignKey:TestID"`
	Results   []UserTestResult `json:"results,omitempty" gorm:"foreignKey:TestID"`
}

// TestQuestion представляет вопрос теста
type TestQuestion struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	TestID    uint      `json:"test_id" gorm:"not null"`
	Question  string    `json:"question" gorm:"type:text;not null"`
	Order     int       `json:"order" gorm:"default:0"`
	Points    int       `json:"points" gorm:"default:1"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Связи
	Test    Test         `json:"test,omitempty" gorm:"foreignKey:TestID"`
	Answers []TestAnswer `json:"answers,omitempty" gorm:"foreignKey:QuestionID"`
}

// TestAnswer представляет вариант ответа на вопрос
type TestAnswer struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	QuestionID uint      `json:"question_id" gorm:"not null"`
	Answer     string    `json:"answer" gorm:"not null"`
	IsCorrect  bool      `json:"is_correct" gorm:"default:false"`
	Order      int       `json:"order" gorm:"default:0"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Связи
	Question TestQuestion `json:"question,omitempty" gorm:"foreignKey:QuestionID"`
}