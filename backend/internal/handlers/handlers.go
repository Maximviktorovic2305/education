package handlers

import (
	"net/http"
	"strconv"

	"go-education-platform/internal/middleware"
	"go-education-platform/internal/models"
	"go-education-platform/internal/services"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}

	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}

	var req services.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	user, err := h.userService.UpdateUserProfile(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}

	var req services.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	if err := h.userService.ChangePassword(userID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "пароль успешно изменён"})
}

// Admin methods
func (h *UserHandler) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	users, total, err := h.userService.GetUsers(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *UserHandler) GetUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	user, err := h.userService.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	var req services.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	user, err := h.userService.UpdateUser(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	if err := h.userService.DeleteUser(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "пользователь удалён"})
}

type CourseHandler struct {
	courseService *services.CourseService
}

func NewCourseHandler(courseService *services.CourseService) *CourseHandler {
	return &CourseHandler{courseService: courseService}
}

func (h *CourseHandler) GetCourses(c *gin.Context) {
	courses, err := h.courseService.GetCourses()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, courses)
}

func (h *CourseHandler) GetCourse(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	course, err := h.courseService.GetCourseByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, course)
}

func (h *CourseHandler) GetCourseSections(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	sections, err := h.courseService.GetCourseSections(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, sections)
}

func (h *CourseHandler) GetLesson(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	lesson, err := h.courseService.GetLessonByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, lesson)
}

// Admin methods
func (h *CourseHandler) CreateCourse(c *gin.Context) {
	var req services.CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	course, err := h.courseService.CreateCourse(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, course)
}

func (h *CourseHandler) UpdateCourse(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	var req services.UpdateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	course, err := h.courseService.UpdateCourse(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, course)
}

func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	if err := h.courseService.DeleteCourse(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "курс удалён"})
}

func (h *CourseHandler) CreateSection(c *gin.Context) {
	var req services.CreateSectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	section, err := h.courseService.CreateSection(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, section)
}

func (h *CourseHandler) UpdateSection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	var req services.UpdateSectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	section, err := h.courseService.UpdateSection(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, section)
}

func (h *CourseHandler) DeleteSection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	if err := h.courseService.DeleteSection(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "раздел удалён"})
}

func (h *CourseHandler) CreateLesson(c *gin.Context) {
	var req services.CreateLessonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	lesson, err := h.courseService.CreateLesson(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, lesson)
}

func (h *CourseHandler) UpdateLesson(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	var req services.UpdateLessonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	lesson, err := h.courseService.UpdateLesson(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, lesson)
}

func (h *CourseHandler) DeleteLesson(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	if err := h.courseService.DeleteLesson(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "урок удалён"})
}

type ProblemHandler struct {
	problemService *services.ProblemService
	sandboxService *services.SandboxService
}

func NewProblemHandler(problemService *services.ProblemService, sandboxService *services.SandboxService) *ProblemHandler {
	return &ProblemHandler{
		problemService: problemService,
		sandboxService: sandboxService,
	}
}

func (h *ProblemHandler) GetProblems(c *gin.Context) {
	difficulty := c.Query("difficulty")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	problems, total, err := h.problemService.GetProblems(difficulty, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"problems": problems,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

func (h *ProblemHandler) GetProblem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	problem, err := h.problemService.GetProblemByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, problem)
}

func (h *ProblemHandler) SubmitSolution(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	var req services.SubmitSolutionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	// Получаем задачу
	problem, err := h.problemService.GetProblemByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Создаём отправку
	submission, err := h.problemService.CreateSubmission(userID, uint(id), req.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Выполняем код в sandbox
	go func() {
		execResult, err := h.sandboxService.ExecuteSubmission(submission, problem)
		if err != nil {
			// Обновляем статус как ошибка системы
			result := &services.SubmissionResult{
				Status:      models.SubmissionStatusRuntimeError,
				ErrorOutput: err.Error(),
			}
			h.problemService.UpdateSubmissionResult(submission.ID, result)
			return
		}

		// Обновляем результат
		result := &services.SubmissionResult{
			Status:        execResult.Status,
			Score:         execResult.Score,
			TestsPassed:   execResult.TestsPassed,
			TestsTotal:    execResult.TestsTotal,
			ExecutionTime: execResult.ExecutionTime,
			MemoryUsed:    execResult.MemoryUsed,
			ErrorOutput:   execResult.ErrorOutput,
		}

		h.problemService.UpdateSubmissionResult(submission.ID, result)
	}()

	c.JSON(http.StatusCreated, submission)
}

func (h *ProblemHandler) GetSubmission(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	submission, err := h.problemService.GetSubmissionByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, submission)
}

func (h *ProblemHandler) GetUserSubmissions(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	submissions, total, err := h.problemService.GetUserSubmissions(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"submissions": submissions,
		"total":       total,
		"page":        page,
		"limit":       limit,
	})
}

// Admin methods
func (h *ProblemHandler) CreateProblem(c *gin.Context) {
	var req services.CreateProblemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	problem, err := h.problemService.CreateProblem(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, problem)
}

func (h *ProblemHandler) UpdateProblem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	var req services.UpdateProblemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}

	problem, err := h.problemService.UpdateProblem(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, problem)
}

func (h *ProblemHandler) DeleteProblem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID"})
		return
	}

	if err := h.problemService.DeleteProblem(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "задача удалена"})
}

type TestHandler struct {
	testService *services.TestService
}

func NewTestHandler(testService *services.TestService) *TestHandler {
	return &TestHandler{testService: testService}
}

// GetTests получает список тестов с пагинацией и фильтрацией
func (h *TestHandler) GetTests(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.Query("search")
	difficulty := c.Query("difficulty")
	
	tests, total, err := h.testService.GetTests(page, limit, search, difficulty)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения тестов"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"tests": tests,
		"total": total,
		"page": page,
		"limit": limit,
	})
}

// GetTest получает тест по ID с вопросами и ответами
func (h *TestHandler) GetTest(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID теста"})
		return
	}
	
	test, err := h.testService.GetTestByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "тест не найден"})
		return
	}
	
	c.JSON(http.StatusOK, test)
}

// StartTest запускает тест для пользователя
func (h *TestHandler) StartTest(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	testID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID теста"})
		return
	}
	
	// TODO: Implement test start logic
	c.JSON(http.StatusOK, gin.H{
		"message": "тест начат",
		"test_id": testID,
		"user_id": userID,
	})
}

// SubmitTest отправляет результаты теста
func (h *TestHandler) SubmitTest(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	testID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID теста"})
		return
	}
	
	// TODO: Implement test submission logic
	c.JSON(http.StatusOK, gin.H{
		"message": "результаты теста отправлены",
		"test_id": testID,
		"user_id": userID,
	})
}

// GetTestResults получает результаты конкретного теста
func (h *TestHandler) GetTestResults(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	testID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID теста"})
		return
	}
	
	// TODO: Implement test results retrieval logic
	c.JSON(http.StatusOK, gin.H{
		"message": "результаты теста",
		"test_id": testID,
		"user_id": userID,
	})
}

// GetUserTestResults получает все результаты тестов пользователя
func (h *TestHandler) GetUserTestResults(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	// TODO: Implement user test results retrieval logic
	c.JSON(http.StatusOK, gin.H{
		"message": "результаты всех тестов пользователя",
		"user_id": userID,
	})
}

// CreateTest создаёт новый тест (админ)
func (h *TestHandler) CreateTest(c *gin.Context) {
	// TODO: Implement test creation logic
	c.JSON(http.StatusOK, gin.H{"message": "тест создан"})
}

// UpdateTest обновляет тест (админ)
func (h *TestHandler) UpdateTest(c *gin.Context) {
	// TODO: Implement test update logic
	c.JSON(http.StatusOK, gin.H{"message": "тест обновлён"})
}

// DeleteTest удаляет тест (админ)
func (h *TestHandler) DeleteTest(c *gin.Context) {
	// TODO: Implement test deletion logic
	c.JSON(http.StatusOK, gin.H{"message": "тест удалён"})
}

type ProgressHandler struct {
	progressService *services.ProgressService
}

func NewProgressHandler(progressService *services.ProgressService) *ProgressHandler {
	return &ProgressHandler{progressService: progressService}
}

// CompleteLesson отмечает урок как завершённый
func (h *ProgressHandler) CompleteLesson(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	lessonID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID урока"})
		return
	}
	
	progress, err := h.progressService.CompleteLesson(userID, uint(lessonID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, progress)
}

// GetUserProgress получает прогресс пользователя по урокам
func (h *ProgressHandler) GetUserProgress(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	progress, err := h.progressService.GetUserProgress(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения прогресса"})
		return
	}
	
	c.JSON(http.StatusOK, progress)
}

// GetUserStats получает статистику пользователя
func (h *ProgressHandler) GetUserStats(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	stats, err := h.progressService.GetUserStatistics(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения статистики"})
		return
	}
	
	c.JSON(http.StatusOK, stats)
}

// GetLevelSystem получает данные системы уровней пользователя
func (h *ProgressHandler) GetLevelSystem(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	levelSystem, err := h.progressService.GetLevelSystem(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения данных системы уровней"})
		return
	}
	
	c.JSON(http.StatusOK, levelSystem)
}

// GetLearningStreak получает информацию о серии обучения пользователя
func (h *ProgressHandler) GetLearningStreak(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	streak, err := h.progressService.GetLearningStreak(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения информации о серии обучения"})
		return
	}
	
	c.JSON(http.StatusOK, streak)
}

// GetSkillProgress получает прогресс по навыкам пользователя
func (h *ProgressHandler) GetSkillProgress(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	skills, err := h.progressService.GetSkillProgress(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения прогресса по навыкам"})
		return
	}
	
	c.JSON(http.StatusOK, skills)
}

// GetLessonProgress получает детальный прогресс по урокам
func (h *ProgressHandler) GetLessonProgress(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	
	// Parse filters from query parameters
	filters := make(map[string]interface{})
	if courseIDStr := c.Query("course_id"); courseIDStr != "" {
		if courseID, err := strconv.ParseUint(courseIDStr, 10, 32); err == nil {
			filters["course_id"] = uint(courseID)
		}
	}
	
	progress, err := h.progressService.GetLessonProgress(userID, page, limit, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения прогресса по урокам"})
		return
	}
	
	c.JSON(http.StatusOK, progress)
}

// UpdateLessonProgress обновляет прогресс по уроку
func (h *ProgressHandler) UpdateLessonProgress(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	lessonID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID урока"})
		return
	}
	
	var req UpdateLessonProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}
	
	progress, err := h.progressService.UpdateLessonProgress(userID, uint(lessonID), req.TimeSpent)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, progress)
}

// GetWeeklyActivity получает данные о недельной активности пользователя
func (h *ProgressHandler) GetWeeklyActivity(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	activity, err := h.progressService.GetWeeklyActivity(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения данных о недельной активности"})
		return
	}
	
	c.JSON(http.StatusOK, activity)
}

// GetMonthlyProgress получает данные о ежемесячном прогрессе пользователя
func (h *ProgressHandler) GetMonthlyProgress(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	progress, err := h.progressService.GetMonthlyProgress(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения данных о ежемесячном прогрессе"})
		return
	}
	
	c.JSON(http.StatusOK, progress)
}

// UpdateLessonProgressRequest структура для запроса обновления прогресса по уроку
type UpdateLessonProgressRequest struct {
	TimeSpent int `json:"time_spent"`
}

type CertificateHandler struct {
	certificateService *services.CertificateService
}

func NewCertificateHandler(certificateService *services.CertificateService) *CertificateHandler {
	return &CertificateHandler{certificateService: certificateService}
}

// GetUserCertificates получает сертификаты пользователя
func (h *CertificateHandler) GetUserCertificates(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	certificates, err := h.certificateService.GetUserCertificates(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка получения сертификатов"})
		return
	}
	
	c.JSON(http.StatusOK, certificates)
}

// GenerateCertificate генерирует новый сертификат
func (h *CertificateHandler) GenerateCertificate(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	var req services.GenerateCertificateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверные данные", "details": err.Error()})
		return
	}
	
	certificate, err := h.certificateService.GenerateCertificate(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка генерации сертификата"})
		return
	}
	
	c.JSON(http.StatusCreated, certificate)
}

// DownloadCertificate скачивает PDF сертификата
func (h *CertificateHandler) DownloadCertificate(c *gin.Context) {
	// TODO: Implement certificate PDF download logic
	c.JSON(http.StatusOK, gin.H{"message": "функционал скачивания сертификата будет реализован позже"})
}

// ValidateCertificate проверяет действительность сертификата по номеру
func (h *CertificateHandler) ValidateCertificate(c *gin.Context) {
	certificateNumber := c.Param("number")
	if certificateNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "не указан номер сертификата"})
		return
	}
	
	result, err := h.certificateService.ValidateCertificate(certificateNumber)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка проверки сертификата"})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// GetVerificationUrl получает URL для проверки сертификата
func (h *CertificateHandler) GetVerificationUrl(c *gin.Context) {
	certificateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID сертификата"})
		return
	}
	
	result, err := h.certificateService.GetVerificationUrl(uint(certificateID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// CheckEligibility проверяет возможность получения сертификатов пользователем
func (h *CertificateHandler) CheckEligibility(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "пользователь не авторизован"})
		return
	}
	
	result, err := h.certificateService.CheckEligibility(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка проверки возможности получения сертификатов"})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// GetCertificate получает конкретный сертификат по ID
func (h *CertificateHandler) GetCertificate(c *gin.Context) {
	certificateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "неверный ID сертификата"})
		return
	}
	
	certificate, err := h.certificateService.GetCertificateByID(uint(certificateID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, certificate)
}
