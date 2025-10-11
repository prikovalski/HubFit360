import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const TDAHAssessmentForm = lazy(() => import('@/components/TDAHAssessmentForm'));

interface LazyTDAHAssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
}

const LazyTDAHAssessmentForm = (props: LazyTDAHAssessmentFormProps) => {
  return (
    <LazyLoader>
      <TDAHAssessmentForm {...props} />
    </LazyLoader>
  );
};

export default LazyTDAHAssessmentForm;
