
import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const AuthSection = lazy(() => import('@/components/AuthSection'));

interface LazyAuthSectionProps {
  onBack: () => void;
  onLogin: () => void;
}

const LazyAuthSection = (props: LazyAuthSectionProps) => {
  return (
    <LazyLoader>
      <AuthSection {...props} />
    </LazyLoader>
  );
};

export default LazyAuthSection;
