import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-primary/5">
      <div className="container mx-auto text-center">
        <h3 className="text-3xl font-bold mb-6">Готовы начать?</h3>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Присоединяйтесь к тысячам разработчиков, которые уже изучают Go на нашей платформе.
        </p>
        <Button size="lg" className="text-lg px-8 cursor-pointer" asChild>
          <a href="/auth/register">
            <Users className="mr-2 h-5 w-5" />
            Зарегистрироваться бесплатно
          </a>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;