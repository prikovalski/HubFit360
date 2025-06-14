
import { useEffect } from 'react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'service';
  data?: any;
}

const StructuredData = ({ type, data }: StructuredDataProps) => {
  const siteConfig = useSiteConfig();

  useEffect(() => {
    const getStructuredData = () => {
      const baseData = {
        "@context": "https://schema.org",
        "@type": type === 'website' ? 'WebSite' : type === 'organization' ? 'Organization' : 'Service',
        name: siteConfig.siteName,
        description: siteConfig.description,
        url: siteConfig.baseUrl
      };

      if (type === 'website') {
        return {
          ...baseData,
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.baseUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          },
          publisher: {
            "@type": "Organization",
            name: siteConfig.siteName,
            logo: {
              "@type": "ImageObject",
              url: `${siteConfig.baseUrl}/lovable-uploads/942e9b47-7e87-4781-86f5-532558bb73f6.png`
            }
          }
        };
      }

      if (type === 'organization') {
        return {
          ...baseData,
          "@type": "Organization",
          logo: {
            "@type": "ImageObject",
            url: `${siteConfig.baseUrl}/lovable-uploads/942e9b47-7e87-4781-86f5-532558bb73f6.png`
          },
          sameAs: [
            siteConfig.socialMedia.facebook,
            siteConfig.socialMedia.instagram,
            siteConfig.socialMedia.linkedin
          ],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: "Portuguese"
          }
        };
      }

      if (type === 'service') {
        return {
          ...baseData,
          "@type": "Service",
          provider: {
            "@type": "Organization",
            name: siteConfig.siteName
          },
          serviceType: "Avaliação Física com IA",
          areaServed: {
            "@type": "Country",
            name: "Brasil"
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Serviços de Avaliação Física",
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Análise de Composição Corporal com IA"
                }
              }
            ]
          }
        };
      }

      return baseData;
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(getStructuredData());
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [type, data, siteConfig]);

  return null;
};

export default StructuredData;
