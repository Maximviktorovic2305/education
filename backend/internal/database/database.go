package database

import (
	"fmt"

	"go-education-platform/internal/config"
	"go-education-platform/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Europe/Moscow",
		cfg.Database.Host,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.Port,
		cfg.Database.SSLMode,
	)

	var logLevel logger.LogLevel
	if cfg.Environment == "development" {
		logLevel = logger.Info
	} else {
		logLevel = logger.Silent
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})

	if err != nil {
		return nil, fmt.Errorf("не удалось подключиться к базе данных: %w", err)
	}

	return db, nil
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Course{},
		&models.Section{},
		&models.Lesson{},
		&models.Problem{},
		&models.Test{},
		&models.TestQuestion{},
		&models.TestAnswer{},
		&models.UserProgress{},
		&models.UserSubmission{},
		&models.UserTestResult{},
		&models.Certificate{},
		&models.RefreshToken{},
	)
}