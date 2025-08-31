package router

import (
	"go-education-platform/internal/config"
	"go-education-platform/internal/handlers"
	"go-education-platform/internal/middleware"
	"go-education-platform/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Database middleware
	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// Инициализируем сервисы
	authService := services.NewAuthService(db, cfg)
	userService := services.NewUserService(db)
	courseService := services.NewCourseService(db)
	problemService := services.NewProblemService(db)
	testService := services.NewTestService(db)
	progressService := services.NewProgressService(db)
	certificateService := services.NewCertificateService(db)
	sandboxService := services.NewSandboxService()
	platformService := services.NewPlatformService(db)

	// Инициализируем хендлеры
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)
	courseHandler := handlers.NewCourseHandler(courseService)
	problemHandler := handlers.NewProblemHandler(problemService, sandboxService)
	testHandler := handlers.NewTestHandler(testService)
	progressHandler := handlers.NewProgressHandler(progressService)
	certificateHandler := handlers.NewCertificateHandler(certificateService)
	platformHandler := handlers.NewPlatformHandler(platformService)

	// API группа
	api := r.Group("/api")

	// Публичные маршруты (без аутентификации)
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.RefreshToken)
		auth.POST("/logout", authHandler.Logout)
	}

	// Публичные маршруты платформы
	platform := api.Group("/platform")
	{
		platform.GET("/features", platformHandler.GetFeatures)
		platform.GET("/levels", platformHandler.GetLevels)
		platform.GET("/stats", platformHandler.GetStats)
	}

	// Защищённые маршруты (требуют аутентификации)
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(cfg.JWT.Secret))

	// Пользователи
	users := protected.Group("/users")
	{
		users.GET("/profile", userHandler.GetProfile)
		users.PUT("/profile", userHandler.UpdateProfile)
		users.POST("/change-password", userHandler.ChangePassword)
		
		// Add missing endpoints that frontend is calling
		users.GET("/me/stats", progressHandler.GetUserStats)        // Fix 404 error
		users.GET("/me/progress", progressHandler.GetUserProgress)  // Additional endpoint
		users.GET("/me/achievements", certificateHandler.GetUserCertificates) // Map to certificates for now
		
		// Additional user endpoints
		users.GET("/me/level-system", progressHandler.GetLevelSystem)
		users.GET("/me/streak", progressHandler.GetLearningStreak)
		users.GET("/me/skills", progressHandler.GetSkillProgress)
		users.GET("/me/activity/weekly", progressHandler.GetWeeklyActivity)
		users.GET("/me/progress/monthly", progressHandler.GetMonthlyProgress)
	}

	// Курсы и уроки
	courses := protected.Group("/courses")
	{
		courses.GET("", courseHandler.GetCourses)
		courses.GET("/:id", courseHandler.GetCourse)
		courses.GET("/:id/sections", courseHandler.GetCourseSections)
	}

	lessons := protected.Group("/lessons")
	{
		lessons.GET("/:id", courseHandler.GetLesson)
		lessons.POST("/:id/complete", progressHandler.CompleteLesson)
	}

	// Практические задачи
	problems := protected.Group("/problems")
	{
		problems.GET("", problemHandler.GetProblems)
		problems.GET("/:id", problemHandler.GetProblem)
		problems.POST("/:id/submit", problemHandler.SubmitSolution)
		problems.GET("/submissions/:id", problemHandler.GetSubmission)
		problems.GET("/my-submissions", problemHandler.GetUserSubmissions)
	}

	// Тесты
	tests := protected.Group("/tests")
	{
		tests.GET("", testHandler.GetTests)
		tests.GET("/:id", testHandler.GetTest)
		tests.POST("/:id/start", testHandler.StartTest)
		tests.POST("/:id/submit", testHandler.SubmitTest)
		tests.GET("/:id/results", testHandler.GetTestResults)
		tests.GET("/my-results", testHandler.GetUserTestResults)
	}

	// Прогресс
	progress := protected.Group("/progress")
	{
		progress.GET("/overview", progressHandler.GetUserProgress)  // Renamed from "" to avoid conflicts
		progress.GET("/statistics", progressHandler.GetUserStats)   // Renamed from "/stats" to avoid conflicts
		progress.GET("/lessons", progressHandler.GetLessonProgress)
		progress.POST("/lessons/:id", progressHandler.UpdateLessonProgress)
	}

	// Сертификаты
	certificates := protected.Group("/certificates")
	{
		certificates.GET("", certificateHandler.GetUserCertificates)
		certificates.POST("/generate", certificateHandler.GenerateCertificate)
		certificates.GET("/:id/download", certificateHandler.DownloadCertificate)
		certificates.GET("/validate/:number", certificateHandler.ValidateCertificate)
		certificates.GET("/:id/verification-url", certificateHandler.GetVerificationUrl)
		certificates.GET("/eligibility", certificateHandler.CheckEligibility)
	}

	// Административные маршруты
	admin := protected.Group("/admin")
	admin.Use(middleware.AdminMiddleware())
	{
		// Управление курсами
		adminCourses := admin.Group("/courses")
		{
			adminCourses.POST("", courseHandler.CreateCourse)
			adminCourses.PUT("/:id", courseHandler.UpdateCourse)
			adminCourses.DELETE("/:id", courseHandler.DeleteCourse)
		}

		// Управление секциями
		adminSections := admin.Group("/sections")
		{
			adminSections.POST("", courseHandler.CreateSection)
			adminSections.PUT("/:id", courseHandler.UpdateSection)
			adminSections.DELETE("/:id", courseHandler.DeleteSection)
		}

		// Управление уроками
		adminLessons := admin.Group("/lessons")
		{
			adminLessons.POST("", courseHandler.CreateLesson)
			adminLessons.PUT("/:id", courseHandler.UpdateLesson)
			adminLessons.DELETE("/:id", courseHandler.DeleteLesson)
		}

		// Управление задачами
		adminProblems := admin.Group("/problems")
		{
			adminProblems.POST("", problemHandler.CreateProblem)
			adminProblems.PUT("/:id", problemHandler.UpdateProblem)
			adminProblems.DELETE("/:id", problemHandler.DeleteProblem)
		}

		// Управление тестами
		adminTests := admin.Group("/tests")
		{
			adminTests.POST("", testHandler.CreateTest)
			adminTests.PUT("/:id", testHandler.UpdateTest)
			adminTests.DELETE("/:id", testHandler.DeleteTest)
		}

		// Управление пользователями
		adminUsers := admin.Group("/users")
		{
			adminUsers.GET("", userHandler.GetUsers)
			adminUsers.GET("/:id", userHandler.GetUser)
			adminUsers.PUT("/:id", userHandler.UpdateUser)
			adminUsers.DELETE("/:id", userHandler.DeleteUser)
		}
	}

	return r
}