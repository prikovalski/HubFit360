
import StructuredData from '@/components/seo/StructuredData';
import SecurityHeaders from '@/components/security/SecurityHeaders';
import AppContent from '@/components/AppContent';

const Index = () => {
  return (
    <>
      <SecurityHeaders />
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="service" />
      <AppContent />
    </>
  );
};

export default Index;
