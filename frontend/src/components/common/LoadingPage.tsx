import LoadingSpinner from '@/components/common/LoadingSpinner';

interface LoadingPageProps {
  message?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ message = 'Загрузка...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default LoadingPage;