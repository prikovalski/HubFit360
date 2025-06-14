
import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const AssessmentForm = lazy(() => import('@/components/AssessmentForm'));

interface LazyAssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const LazyAssessmentForm = (props: LazyAssessmentFormProps) => {
  return (
    <LazyLoader>
      <AssessmentForm {...props} />
    </LazyLoader>
  );
};

export default LazyAssessmentForm;
