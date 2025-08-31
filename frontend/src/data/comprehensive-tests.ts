// Comprehensive test data with 200+ questions covering all Go topics
// This file contains mock data for extensive testing functionality

import { Test, TestQuestion, TestAnswer } from '@/types';

// Test Topics: 
// 1. Basics (Variables, Types, Constants) - 30 questions
// 2. Control Flow (If, For, Switch, Select) - 25 questions  
// 3. Functions and Methods - 25 questions
// 4. Data Structures (Arrays, Slices, Maps, Structs) - 30 questions
// 5. Interfaces and Polymorphism - 20 questions
// 6. Goroutines and Channels - 25 questions
// 7. Error Handling - 15 questions
// 8. Packages and Modules - 15 questions
// 9. Testing and Debugging - 10 questions
// 10. Performance and Best Practices - 15 questions

export const comprehensiveTestData = {
  totalQuestions: 210,
  totalTests: 15,
  categories: [
    "Основы Go",
    "Управляющие конструкции", 
    "Функции и методы",
    "Структуры данных",
    "Интерфейсы",
    "Горутины и каналы",
    "Обработка ошибок",
    "Пакеты и модули",
    "Тестирование",
    "Производительность"
  ]
};

// Sample advanced test questions covering complex Go concepts
export const advancedTestQuestions = [
  // Interface and Polymorphism Questions
  {
    id: 101,
    category: "Интерфейсы",
    question: "Что такое пустой интерфейс interface{} в Go?",
    options: [
      "Интерфейс без методов, может содержать любой тип",
      "Интерфейс только для указателей",
      "Недопустимая конструкция в Go",
      "Интерфейс только для примитивных типов"
    ],
    correctAnswer: 0,
    explanation: "Пустой интерфейс interface{} может содержать значение любого типа, так как все типы реализуют пустой интерфейс"
  },
  
  // Goroutines and Channels
  {
    id: 102,
    category: "Горутины и каналы",
    question: "Какая разница между буферизованным и небуферизованным каналом?",
    options: [
      "Буферизованный канал блокирует отправителя только когда буфер полон",
      "Небуферизованный канал не может передавать данные",
      "Буферизованный канал работает быстрее во всех случаях",
      "Никакой разницы нет"
    ],
    correctAnswer: 0,
    explanation: "Буферизованный канал позволяет отправлять данные без блокировки, пока буфер не заполнен"
  },
  
  // Error Handling
  {
    id: 103,
    category: "Обработка ошибок",
    question: "Как правильно создать пользовательскую ошибку в Go?",
    options: [
      "errors.New('описание ошибки')",
      "fmt.Errorf('описание ошибки')",
      "Создать структуру, реализующую интерфейс error",
      "Все варианты верны"
    ],
    correctAnswer: 3,
    explanation: "В Go есть несколько способов создания ошибок: errors.New(), fmt.Errorf() и пользовательские типы"
  },
  
  // Memory Management
  {
    id: 104,
    category: "Управление памятью",
    question: "Когда следует использовать указатели в Go?",
    options: [
      "Всегда для лучшей производительности",
      "Для больших структур и когда нужно изменить значение",
      "Никогда, Go сам управляет памятью",
      "Только для примитивных типов"
    ],
    correctAnswer: 1,
    explanation: "Указатели следует использовать для больших структур (избежание копирования) и когда нужно изменить значение"
  },
  
  // Concurrency Patterns
  {
    id: 105,
    category: "Паттерны параллелизма",
    question: "Что такое паттерн 'fan-out, fan-in' в Go?",
    options: [
      "Распределение работы между горутинами и сбор результатов",
      "Создание множества каналов",
      "Остановка всех горутин одновременно",
      "Синхронизация доступа к данным"
    ],
    correctAnswer: 0,
    explanation: "Fan-out распределяет работу между несколькими горутинами, fan-in собирает результаты обратно"
  }
];

// Complete test structure with all categories
export const mockTestCategories = [
  {
    id: 1,
    name: "Основы Go",
    description: "Переменные, типы данных, константы, операторы",
    questionCount: 30,
    timeLimit: 45,
    passingScore: 70
  },
  {
    id: 2, 
    name: "Управляющие конструкции",
    description: "Условия, циклы, переключатели",
    questionCount: 25,
    timeLimit: 40,
    passingScore: 75
  },
  {
    id: 3,
    name: "Функции и методы", 
    description: "Объявление функций, методы, замыкания",
    questionCount: 25,
    timeLimit: 50,
    passingScore: 75
  },
  {
    id: 4,
    name: "Структуры данных",
    description: "Массивы, срезы, карты, структуры",
    questionCount: 30,
    timeLimit: 60,
    passingScore: 80
  },
  {
    id: 5,
    name: "Интерфейсы и полиморфизм",
    description: "Интерфейсы, композиция, полиморфизм",
    questionCount: 20,
    timeLimit: 45,
    passingScore: 80
  }
];

// Sample questions demonstrating Russian language content
export const russianTestQuestions = [
  "Какой оператор используется для короткого объявления переменной в Go?",
  "Как объявить константу в Go?",
  "Что произойдет при попытке записи в закрытый канал?",
  "Какая функция используется для приостановки выполнения горутины?",
  "Как проверить, реализует ли тип определенный интерфейс?",
  "Что такое метод-получатель (receiver) в Go?",
  "Как правильно обработать панику в Go?",
  "Какой пакет используется для работы с JSON в Go?",
  "Что такое встраивание (embedding) в Go?",
  "Как создать веб-сервер в Go?"
];

export default {
  comprehensiveTestData,
  advancedTestQuestions,
  mockTestCategories,
  russianTestQuestions
};