
import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'service';
  data?: any;
}

const StructuredData = ({ type, data }: StructuredDataProps) => {
  useEffect(() => {
    const getStructuredData = () => {
      const baseData = {
        "@context": "https://schema.org",
        "@type": type === 'website' ? 'WebSite' : type === 'organization' ? 'Organization' : 'Service',
        name: "HubFit360",
        description: "Avaliação física completa com IA para direcionamento personalizado de treinos e dieta",
        url: "https://yourdomain.com"
      };

      if (type === 'website') {
        return {
          ...baseData,
          potentialAction: {
            "@type": "SearchAction",
            target: "https://yourdomain.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        };
      }

      if (type === 'organization') {
        return {
          ...baseData,
          "@type": "Organization",
          logo: "https://yourdomain.com/lovable-uploads/942e9b47-7e87-4781-86f5-532558bb73f6.png",
          sameAs: [
            "https://www.facebook.com/hubfit360",
            "https://www.instagram.com/hubfit360",
            "https://www.linkedin.com/company/hubfit360"
          ]
        };
      }

      if (type === 'service') {
        return {
          ...baseData,
          "@type": "Service",
          provider: {
            "@type": "Organization",
            name: "HubFit360"
          },
          serviceType: "Avaliação Física com IA",
          areaServed: "Brasil"
        };
      }

      return baseData;
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(getStructuredData());
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [type, data]);

  return null;
};

export default StructuredData;
