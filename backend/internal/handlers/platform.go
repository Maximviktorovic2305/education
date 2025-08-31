package handlers

import (
	"net/http"

	"go-education-platform/internal/services"

	"github.com/gin-gonic/gin"
)

type PlatformHandler struct {
	platformService *services.PlatformService
}

func NewPlatformHandler(platformService *services.PlatformService) *PlatformHandler {
	return &PlatformHandler{
		platformService: platformService,
	}
}

// GetFeatures возвращает все активные функции платформы
// @Summary Получить функции платформы
// @Description Возвращает список всех активных функций платформы с актуальными счетчиками
// @Tags platform
// @Produce json
// @Success 200 {array} models.Feature
// @Failure 500 {object} map[string]interface{}
// @Router /api/platform/features [get]
func (h *PlatformHandler) GetFeatures(c *gin.Context) {
	features, err := h.platformService.GetFeatures()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Ошибка при получении функций платформы",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, features)
}

// GetLevels возвращает все активные уровни
// @Summary Получить уровни платформы
// @Description Возвращает список всех активных уровней, отсортированных по количеству очков
// @Tags platform
// @Produce json
// @Success 200 {array} models.Level
// @Failure 500 {object} map[string]interface{}
// @Router /api/platform/levels [get]
func (h *PlatformHandler) GetLevels(c *gin.Context) {
	levels, err := h.platformService.GetLevels()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Ошибка при получении уровней платформы",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, levels)
}

// GetStats возвращает общую статистику платформы
// @Summary Получить статистику платформы
// @Description Возвращает общую статистику платформы с актуальными данными
// @Tags platform
// @Produce json
// @Success 200 {object} models.PlatformStats
// @Failure 500 {object} map[string]interface{}
// @Router /api/platform/stats [get]
func (h *PlatformHandler) GetStats(c *gin.Context) {
	stats, err := h.platformService.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Ошибка при получении статистики платформы",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, stats)
}