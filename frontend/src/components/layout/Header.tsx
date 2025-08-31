import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/Logo';

const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo size="md" />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Курсы
          </Link>
          <Link href="/practice" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Практика
          </Link>
          <Link href="/tests" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Тестирование
          </Link>
          <Link href="/certificates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Сертификаты
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Вход</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Регистрация</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;