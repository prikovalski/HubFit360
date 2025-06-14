
import { AuthProvider } from '@/hooks/useAuth';
import StructuredData from '@/components/seo/StructuredData';
import SecurityHeaders from '@/components/security/SecurityHeaders';
import AppContent from '@/components/AppContent';

const Index = () => {
  return (
    <AuthProvider>
      <SecurityHeaders />
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="service" />
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
