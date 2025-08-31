# Образовательная платформа для изучения Go

Веб-платформа для изучения языка программирования Go на русском языке с интерактивными уроками, практическими заданиями, тестами и системой сертификации.

## Технологический стек

### Frontend
- Next.js 15 с TypeScript
- Tailwind CSS для стилизации
- shadcn/ui для UI компонентов
- Zustand для управления состоянием
- Monaco Editor для редактирования кода

### Backend
- Go
- PostgreSQL с GORM
- JWT аутентификация (access + refresh токены)
- REST API

## Структура проекта

```
/go-site/
├── /backend/              # Go API сервер
├── /frontend/             # Next.js приложение
├── .env.example          # Пример файла окружения
└── README.md
```

## Быстрый старт

### Требования
- Node.js 18+
- Go 1.21+
- PostgreSQL 13+

### Установка

1. Клонирование репозитория
```bash
git clone <repository-url>
cd go-site
```

2. Настройка переменных окружения
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

3. Запуск backend
```bash
cd backend
go mod init go-education-platform
go mod tidy
go run main.go
```

4. Запуск frontend
```bash
cd frontend
npm install
npm run dev
```

## Функциональность

### 📚 Обучение
- Структурированные курсы по разделам
- Теоретические уроки с примерами кода
- Интерактивные задания с автопроверкой

### 🧪 Практика
- Задачи разной сложности (Легко/Средне/Сложно)
- Встроенный редактор кода
- Автоматическая проверка решений

### 📝 Тестирование
- Тесты с множественным выбором
- Автоматическая оценка
- Детальная статистика

### 🏆 Геймификация
- Система баллов и уровней
- Сертификаты достижений
- Отслеживание прогресса

### 🎨 Дизайн
- Тёмная тема по умолчанию
- Переключение на светлую тему
- Адаптивный дизайн для мобильных устройств

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Авторизация
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход

### Курсы и уроки
- `GET /api/courses` - Список курсов
- `GET /api/courses/{id}/sections` - Разделы курса
- `GET /api/lessons/{id}` - Содержимое урока
- `POST /api/lessons/{id}/complete` - Завершение урока

### Практические задания
- `GET /api/problems` - Список задач
- `POST /api/problems/{id}/submit` - Отправка решения
- `GET /api/submissions/{id}` - Результат проверки

### Тесты
- `GET /api/tests` - Список тестов
- `POST /api/tests/{id}/submit` - Отправка ответов
- `GET /api/tests/{id}/results` - Результаты теста

### Прогресс и сертификаты
- `GET /api/progress` - Прогресс пользователя
- `GET /api/certificates` - Сертификаты пользователя
- `POST /api/certificates/generate` - Генерация сертификата

## Разработка

### Контрибьюция
1. Создайте форк репозитория
2. Создайте ветку для вашей функции (`git checkout -b feature/AmazingFeature`)
3. Зафиксируйте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Отправьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

### Лицензия
Этот проект лицензирован под MIT License - см. файл LICENSE для деталей.

## Поддержка

Если у вас есть вопросы или предложения, создайте issue в репозитории.