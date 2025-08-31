import Logo from '@/components/common/Logo';

const Footer = () => {
  return (
    <footer className="border-t bg-background py-12 px-4">
      <div className="container mx-auto text-center">
        <div className="mb-4">
          <Logo size="md" />
        </div>
        <p className="text-sm text-muted-foreground">
          © 2024 Образовательная платформа для изучения Go. Все права защищены.
        </p>
      </div>
    </footer>
  );
};

export default Footer;