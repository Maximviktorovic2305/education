'use client';

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
  showAuth?: boolean;
  position?: 'fixed' | 'sticky' | 'relative';
  className?: string;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  showAuth = true,
  position = 'relative',
  className,
  title = "Платформа изучения Go"
}) => {
  const positionClasses = {
    fixed: "fixed top-0 left-0 right-0 z-50",
    sticky: "sticky top-0 z-50", 
    relative: "relative"
  };

  return (
    <header className={cn(
      "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      positionClasses[position],
      className
    )}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Title */}
        <Link 
          href="/" 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Logo size="md" clickable={false} />
          <h1 className="text-xl font-bold">{title}</h1>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {showAuth && (
            <>
              <Button variant="outline" asChild className="cursor-pointer">
                <Link href="/auth/login">Войти</Link>
              </Button>
              <Button asChild className="cursor-pointer">
                <Link href="/auth/register">Регистрация</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};