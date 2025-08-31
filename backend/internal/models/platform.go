package models

import (
	"time"
)

// Feature представляет функции платформы
type Feature struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	Count       int       `json:"count" gorm:"default:0"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	Order       int       `json:"order" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Level представляет уровни пользователей на платформе
type Level struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	Points      int       `json:"points" gorm:"not null"`
	Color       string    `json:"color"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	Order       int       `json:"order" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// PlatformStats представляет статистику платформы
type PlatformStats struct {
	TotalUsers    int `json:"totalUsers"`
	TotalLessons  int `json:"totalLessons"`
	TotalProblems int `json:"totalProblems"`
	TotalTests    int `json:"totalTests"`
}