
import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const UserDashboard = lazy(() => import('@/components/UserDashboard'));

interface LazyUserDashboardProps {
  onNewAssessment: () => void;
  onViewReport: (report: any) => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const LazyUserDashboard = (props: LazyUserDashboardProps) => {
  return (
    <LazyLoader>
      <UserDashboard {...props} />
    </LazyLoader>
  );
};

export default LazyUserDashboard;
