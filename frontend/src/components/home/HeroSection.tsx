import { Button } from '@/components/ui/button';
import { Book, PlayCircle } from 'lucide-react';

const HeroSection = () => {
  return (
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
          <Button size="lg" className="text-lg px-8 cursor-pointer" asChild>
            <a href="/auth/register">
              <PlayCircle className="mr-2 h-5 w-5" />
              Начать обучение
            </a>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 cursor-pointer" asChild>
            <a href="/courses">
              <Book className="mr-2 h-5 w-5" />
              Посмотреть курсы
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;