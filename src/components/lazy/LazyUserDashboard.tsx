
import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const UserDashboard = lazy(() => import('@/components/UserDashboard'));

interface LazyUserDashboardProps {
  user: any;
  onLogout: () => void;
}

const LazyUserDashboard = (props: LazyUserDashboardProps) => {
  return (
    <LazyLoader>
      <UserDashboard {...props} />
    </LazyLoader>
  );
};

export default LazyUserDashboard;
