import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const DIVA2AssessmentForm = lazy(() => import('@/components/DIVA2AssessmentForm'));

interface LazyDIVA2AssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
}

const LazyDIVA2AssessmentForm = (props: LazyDIVA2AssessmentFormProps) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Carregando avaliação DIVA 2.0..." />
      </div>
    }>
      <DIVA2AssessmentForm {...props} />
    </Suspense>
  );
};

export default LazyDIVA2AssessmentForm;
