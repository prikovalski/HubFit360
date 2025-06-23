
import { lazy } from 'react';
import LazyLoader from '@/components/LazyLoader';

const UserProfile = lazy(() => import('@/components/UserProfile'));

interface LazyUserProfileProps {
  onBack: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
}

const LazyUserProfile = (props: LazyUserProfileProps) => {
  return (
    <LazyLoader>
      <UserProfile {...props} />
    </LazyLoader>
  );
};

export default LazyUserProfile;
