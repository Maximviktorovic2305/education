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

// TODO: Implement test handlers
func (h *TestHandler) GetTests(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *TestHandler) GetTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *TestHandler) StartTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *TestHandler) SubmitTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *TestHandler) GetTestResults(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *TestHandler) GetUserTestResults(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *TestHandler) CreateTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *TestHandler) UpdateTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *TestHandler) DeleteTest(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

type ProgressHandler struct {
	progressService *services.ProgressService
}

func NewProgressHandler(progressService *services.ProgressService) *ProgressHandler {
	return &ProgressHandler{progressService: progressService}
}

// TODO: Implement progress handlers
func (h *ProgressHandler) CompleteLesson(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *ProgressHandler) GetUserProgress(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *ProgressHandler) GetUserStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

type CertificateHandler struct {
	certificateService *services.CertificateService
}

func NewCertificateHandler(certificateService *services.CertificateService) *CertificateHandler {
	return &CertificateHandler{certificateService: certificateService}
}

// TODO: Implement certificate handlers
func (h *CertificateHandler) GetUserCertificates(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *CertificateHandler) GenerateCertificate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}

func (h *CertificateHandler) DownloadCertificate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Not implemented yet"})
}