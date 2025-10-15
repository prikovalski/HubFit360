import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const BigFiveAssessmentForm = lazy(() => import('@/components/BigFiveAssessmentForm'));

interface LazyBigFiveAssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
}

const LazyBigFiveAssessmentForm = (props: LazyBigFiveAssessmentFormProps) => {
  return (
    <LazyLoader>
      <BigFiveAssessmentForm {...props} />
    </LazyLoader>
  );
};

export default LazyBigFiveAssessmentForm;
