
import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const ReportViewer = lazy(() => import('@/components/ReportViewer'));

interface LazyReportViewerProps {
  report: any;
  onBack: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const LazyReportViewer = (props: LazyReportViewerProps) => {
  return (
    <LazyLoader>
      <ReportViewer {...props} />
    </LazyLoader>
  );
};

export default LazyReportViewer;
