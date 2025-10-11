
import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const PhysicalAssessmentDashboard = lazy(() => import('@/components/PhysicalAssessmentDashboard'));

interface LazyPhysicalAssessmentDashboardProps {
  onNewAssessment: () => void;
  onViewReport: (report: any) => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const LazyPhysicalAssessmentDashboard = (props: LazyPhysicalAssessmentDashboardProps) => {
  return (
    <LazyLoader>
      <PhysicalAssessmentDashboard {...props} />
    </LazyLoader>
  );
};

export default LazyPhysicalAssessmentDashboard;
