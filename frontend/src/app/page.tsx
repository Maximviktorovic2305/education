'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Book, Code, Trophy, Users, CheckCircle, PlayCircle } from 'lucide-react';

export default function Home() {

  const features = [
    {
      icon: <Book className="h-8 w-8" />,
      title: '20+ уроков',
      description: 'Структурированные уроки по основам Go программирования',
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: '60+ задач',
      description: 'Практические задания разной сложности',
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: '200+ тестов',
      description: 'Проверка знаний с автоматической оценкой',
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: 'Сертификаты',
      description: 'Получайте сертификаты за достижения',
    },
  ];

  const levels = [
    { name: 'Junior', points: 100, color: 'text-green-500' },
    { name: 'Middle', points: 300, color: 'text-blue-500' },
    { name: 'Senior', points: 600, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Платформа изучения Go</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <a href="/auth/login">Войти</a>
            </Button>
            <Button asChild>
              <a href="/auth/register">Регистрация</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Изучайте Go
            <br />
            на практике
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Комплексная образовательная платформа для изучения языка программирования Go
            с интерактивными уроками, практическими заданиями и системой сертификации.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <a href="/auth/register">
                <PlayCircle className="mr-2 h-5 w-5" />
                Начать обучение
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <a href="/courses">
                <Book className="mr-2 h-5 w-5" />
                Посмотреть курсы
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Что вас ждёт</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto p-3 bg-primary/10 rounded-lg text-primary w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Система уровней</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {levels.map((level, index) => (
              <Card key={index} className="text-center relative overflow-hidden">
                <CardHeader>
                  <div className="mx-auto">
                    <Trophy className={`h-12 w-12 ${level.color}`} />
                  </div>
                  <CardTitle className={`text-2xl ${level.color}`}>
                    {level.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    От {level.points} баллов
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Получите сертификат {level.name} разработчика
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Готовы начать?</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам разработчиков, которые уже изучают Go на нашей платформе.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <a href="/auth/register">
              <Users className="mr-2 h-5 w-5" />
              Зарегистрироваться бесплатно
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Code className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Платформа изучения Go</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Образовательная платформа для изучения Go. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
