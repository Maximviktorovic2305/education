package main

import (
	"log"
	"os"

	"go-education-platform/internal/config"
	"go-education-platform/internal/database"
	"go-education-platform/internal/router"
	"go-education-platform/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Загружаем переменные окружения
	if err := godotenv.Load(); err != nil {
		log.Println("Файл .env не найден, используются системные переменные")
	}

	// Инициализируем конфигурацию
	cfg := config.Load()

	// Подключаемся к базе данных
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal("Не удалось подключиться к базе данных:", err)
	}

	// Выполняем миграции
	if err := database.Migrate(db); err != nil {
		log.Fatal("Не удалось выполнить миграции:", err)
	}

	// Инициализируем платформенный сервис и заполняем базовые данные
	platformService := services.NewPlatformService(db)
	if err := platformService.SeedDefaultFeatures(); err != nil {
		log.Printf("Предупреждение: не удалось инициализировать функции платформы: %v", err)
	}
	if err := platformService.SeedDefaultLevels(); err != nil {
		log.Printf("Предупреждение: не удалось инициализировать уровни платформы: %v", err)
	}

	// Настраиваем режим Gin
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Создаём роутер
	r := router.Setup(db, cfg)

	// Запускаем сервер
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Сервер запущен на порту %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Не удалось запустить сервер:", err)
	}
}