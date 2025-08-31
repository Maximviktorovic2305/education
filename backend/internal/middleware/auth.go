package middleware

import (
	"net/http"
	"strings"

	"go-education-platform/internal/utils"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware проверяет JWT токен
func AuthMiddleware(secretKey string) gin.HandlerFunc {
	jwtUtils := utils.NewJWTUtils(secretKey)

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Отсутствует токен авторизации",
			})
			c.Abort()
			return
		}

		// Извлекаем токен из заголовка "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Неверный формат токена",
			})
			c.Abort()
			return
		}

		tokenString := tokenParts[1]
		claims, err := jwtUtils.ParseToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Недействительный токен",
			})
			c.Abort()
			return
		}

		// Сохраняем информацию о пользователе в контексте
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)

		c.Next()
	}
}

// AdminMiddleware проверяет права администратора
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Пользователь не авторизован",
			})
			c.Abort()
			return
		}

		if userRole != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Недостаточно прав доступа",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetUserIDFromContext извлекает ID пользователя из контекста
func GetUserIDFromContext(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}

	id, ok := userID.(uint)
	return id, ok
}

// GetUserRoleFromContext извлекает роль пользователя из контекста
func GetUserRoleFromContext(c *gin.Context) (string, bool) {
	userRole, exists := c.Get("user_role")
	if !exists {
		return "", false
	}

	role, ok := userRole.(string)
	return role, ok
}