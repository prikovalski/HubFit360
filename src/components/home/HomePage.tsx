
import HomeSection from './HomeSection';
import FeaturesSection from './FeaturesSection';
import CTASection from './CTASection';

interface HomePageProps {
  setCurrentSection: (section: string) => void;
}

const HomePage = ({ setCurrentSection }: HomePageProps) => {
  return (
    <div>
      <HomeSection setCurrentSection={setCurrentSection} />
      <FeaturesSection />
      <CTASection setCurrentSection={setCurrentSection} />
    </div>
  );
};

export default HomePage;
