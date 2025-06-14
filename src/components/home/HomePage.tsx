
import HomeSection from './HomeSection';
import FeaturesSection from './FeaturesSection';
import CTASection from './CTASection';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

interface HomePageProps {
  setCurrentSection: (section: string) => void;
}

const HomePage = ({ setCurrentSection }: HomePageProps) => {
  const breadcrumbItems = [
    { label: 'Início', current: true }
  ];

  return (
    <div>
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs items={breadcrumbItems} className="mb-4" />
      </div>
      <HomeSection setCurrentSection={setCurrentSection} />
      <FeaturesSection />
      <CTASection setCurrentSection={setCurrentSection} />
    </div>
  );
};

export default HomePage;
