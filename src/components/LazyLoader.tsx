
import { Suspense, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ErrorBoundary from '@/components/ErrorBoundary';

interface LazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const LazyLoader = ({ children, fallback }: LazyLoaderProps) => {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <LoadingSpinner size="lg" text="Carregando..." />
    </div>
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyLoader;
