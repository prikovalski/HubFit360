
import { useMemo } from 'react';

interface SiteConfig {
  baseUrl: string;
  siteName: string;
  description: string;
  keywords: string;
  author: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    linkedin: string;
  };
}

export const useSiteConfig = (): SiteConfig => {
  return useMemo(() => ({
    baseUrl: import.meta.env.VITE_SITE_URL || 'https://yourdomain.com',
    siteName: 'HubFit360',
    description: 'Avaliação física completa com IA para direcionamento personalizado de treinos e dieta. Análise precisa da composição corporal com % de massa magra, gordura e IMC.',
    keywords: 'avaliação física, análise corporal, IA, inteligência artificial, fitness, treino personalizado, dieta, composição corporal, IMC, massa magra',
    author: 'HubFit360',
    socialMedia: {
      facebook: 'https://www.facebook.com/hubfit360',
      instagram: 'https://www.instagram.com/hubfit360',
      linkedin: 'https://www.linkedin.com/company/hubfit360'
    }
  }), []);
};
