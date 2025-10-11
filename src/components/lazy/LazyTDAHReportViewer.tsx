import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const TDAHReportViewer = lazy(() => import('@/components/TDAHReportViewer'));

interface LazyTDAHReportViewerProps {
  report: any;
  onBack: () => void;
}

const LazyTDAHReportViewer = (props: LazyTDAHReportViewerProps) => {
  return (
    <LazyLoader>
      <TDAHReportViewer {...props} />
    </LazyLoader>
  );
};

export default LazyTDAHReportViewer;
