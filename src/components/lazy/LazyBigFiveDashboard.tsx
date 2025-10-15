import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const BigFiveDashboard = lazy(() => import('@/components/BigFiveDashboard'));

interface LazyBigFiveDashboardProps {
  onBack: () => void;
  onNewAssessment?: () => void;
}

const LazyBigFiveDashboard = (props: LazyBigFiveDashboardProps) => {
  return (
    <LazyLoader>
      <BigFiveDashboard {...props} />
    </LazyLoader>
  );
};

export default LazyBigFiveDashboard;
