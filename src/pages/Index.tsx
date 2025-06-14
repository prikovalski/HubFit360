
import { AuthProvider } from '@/hooks/useAuth';
import StructuredData from '@/components/seo/StructuredData';
import AppContent from '@/components/AppContent';

const Index = () => {
  return (
    <AuthProvider>
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="service" />
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
