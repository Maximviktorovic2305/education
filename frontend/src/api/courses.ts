import { Course, Section, Lesson } from '@/types';
import { api } from './client';

// Comprehensive mock data for Russian language courses
const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Основы программирования на Go',
    description: 'Изучите основы языка программирования Go: синтаксис, типы данных, функции и базовые концепции.',
    image_url: '/images/go-basics.jpg',
    order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Продвинутое программирование на Go',
    description: 'Углубленное изучение Go: горутины, каналы, интерфейсы, рефлексия и лучшие практики.',
    image_url: '/images/go-advanced.jpg',
    order: 2,
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    title: 'Веб-разработка на Go',
    description: 'Создание веб-приложений на Go: HTTP-серверы, REST API, работа с базами данных и деплой.',
    image_url: '/images/go-web.jpg',
    order: 3,
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

const mockSections: Record<number, Section[]> = {
  1: [ // Основы программирования на Go
    {
      id: 1,
      course_id: 1,
      title: 'Введение в Go',
      description: 'История языка, установка и первая программа',
      order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      course_id: 1,
      title: 'Основные типы данных',
      description: 'Числа, строки, булевы значения и их использование',
      order: 2,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      course_id: 1,
      title: 'Переменные и константы',
      description: 'Объявление переменных, область видимости и константы',
      order: 3,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 4,
      course_id: 1,
      title: 'Операторы и выражения',
      description: 'Арифметические, логические и операторы сравнения',
      order: 4,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 5,
      course_id: 1,
      title: 'Управляющие конструкции',
      description: 'Условия, циклы и переключатели',
      order: 5,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 6,
      course_id: 1,
      title: 'Функции',
      description: 'Объявление функций, параметры и возвращаемые значения',
      order: 6,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 7,
      course_id: 1,
      title: 'Массивы и срезы',
      description: 'Работа с коллекциями данных',
      order: 7,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  2: [ // Продвинутое программирование на Go
    {
      id: 8,
      course_id: 2,
      title: 'Структуры и методы',
      description: 'Пользовательские типы данных и методы',
      order: 1,
      is_active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 9,
      course_id: 2,
      title: 'Интерфейсы',
      description: 'Полиморфизм и композиция интерфейсов',
      order: 2,
      is_active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 10,
      course_id: 2,
      title: 'Горутины и параллелизм',
      description: 'Легковесные потоки и параллельное выполнение',
      order: 3,
      is_active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 11,
      course_id: 2,
      title: 'Каналы и синхронизация',
      description: 'Передача данных между горутинами',
      order: 4,
      is_active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 12,
      course_id: 2,
      title: 'Обработка ошибок',
      description: 'Правильная обработка и возврат ошибок',
      order: 5,
      is_active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ],
  3: [ // Веб-разработка на Go
    {
      id: 13,
      course_id: 3,
      title: 'HTTP и веб-серверы',
      description: 'Создание HTTP-серверов и обработка запросов',
      order: 1,
      is_active: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
    {
      id: 14,
      course_id: 3,
      title: 'REST API',
      description: 'Разработка RESTful веб-сервисов',
      order: 2,
      is_active: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
    {
      id: 15,
      course_id: 3,
      title: 'Работа с базами данных',
      description: 'Подключение и работа с SQL базами данных',
      order: 3,
      is_active: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
    {
      id: 16,
      course_id: 3,
      title: 'Middleware и роутинг',
      description: 'Промежуточное ПО и маршрутизация запросов',
      order: 4,
      is_active: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
    {
      id: 17,
      course_id: 3,
      title: 'Тестирование и деплой',
      description: 'Написание тестов и развертывание приложений',
      order: 5,
      is_active: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
  ],
};

const mockLessons: Record<number, Lesson> = {
  1: {
    id: 1,
    section_id: 1,
    title: 'История и философия Go',
    content: 'Go (также известный как Golang) — это открытый язык программирования, разработанный в Google. Он был создан для решения проблем современной разработки и отличается простотой, производительностью и встроенной поддержкой параллелизма.',
    code_example: 'package main\\n\\nimport \"fmt\"\\n\\nfunc main() {\\n    fmt.Println(\"Привет, мир Go!\")\\n    fmt.Println(\"Go создан для современной разработки\")\\n}',
    order: 1,
    points: 10,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  2: {
    id: 2,
    section_id: 1,
    title: 'Установка и настройка среды разработки',
    content: 'Установка Go: скачайте с golang.org, настройте переменные окружения. Рекомендуется использовать Visual Studio Code с расширением Go для разработки.',
    code_example: 'package main\\n\\nimport (\\n    \"fmt\"\\n    \"runtime\"\\n)\\n\\nfunc main() {\\n    fmt.Printf(\"Go версия: %s\\\\n\", runtime.Version())\\n    fmt.Printf(\"ОС: %s\\\\n\", runtime.GOOS)\\n    fmt.Printf(\"Архитектура: %s\\\\n\", runtime.GOARCH)\\n}',
    order: 2,
    points: 15,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  3: {
    id: 3,
    section_id: 2,
    title: 'Числовые типы данных',
    content: 'Go предоставляет различные числовые типы: int8, int16, int32, int64, uint8, uint16, uint32, uint64, float32, float64, complex64, complex128. Нулевые значения всех числовых типов равны 0.',
    code_example: 'package main\\n\\nimport \"fmt\"\\n\\nfunc main() {\\n    var a int = 42\\n    var b float64 = 3.14\\n    var c complex128 = 3 + 4i\\n    \\n    fmt.Printf(\"int: %d\\\\n\", a)\\n    fmt.Printf(\"float64: %.2f\\\\n\", b)\\n    fmt.Printf(\"complex128: %v\\\\n\", c)\\n}',
    order: 1,
    points: 20,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

class CourseAPI {
  async getCourses(): Promise<Course[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockCourses;
  }

  async getCourse(id: number): Promise<Course> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const course = mockCourses.find(c => c.id === id);
    if (!course) {
      throw new Error(`Курс с ID ${id} не найден`);
    }
    return {
      ...course,
      sections: mockSections[id] || [],
    };
  }

  async getCourseSections(courseId: number): Promise<Section[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockSections[courseId] || [];
  }

  async getLesson(id: number): Promise<Lesson> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const lesson = mockLessons[id];
    if (!lesson) {
      throw new Error(`Урок с ID ${id} не найден`);
    }
    return lesson;
  }

  async completeLesson(id: number): Promise<{ success: boolean; points: number }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const lesson = mockLessons[id];
    if (!lesson) {
      throw new Error(`Урок с ID ${id} не найден`);
    }
    return {
      success: true,
      points: lesson.points,
    };
  }
}

export const courseApi = new CourseAPI();